import type { Lesson } from "../lib/types";

export const designNewsFeed: Lesson = {
  id: "design-news-feed",
  title: "Design a News Feed",
  summary:
    "Build a timeline that loads fast for millions of readers, from fan-out to ranking to caches.",
  minutes: 14,
  level: "intermediate",
  goals: [
    "Why a feed is a read-heavy problem",
    "Fan-out on read versus fan-out on write",
    "How celebrities break push and how a hybrid fixes it",
    "How ranking and timeline caches fit together",
    "What happens when the cache is lost",
  ],
  takeaways: [
    "A feed is read far more than it is written, so do the work at write time and make reads a single cache lookup.",
    "Pure push fails for accounts with millions of followers; pull their posts at read time and merge them in.",
    "Cache lists of post ids per user, rank a few hundred candidates on read, and be ready to rebuild a lost timeline.",
  ],
  hud: [
    { label: "Feed latency", icon: "timer" },
    { label: "Reads / s", icon: "download" },
    { label: "DB queries", icon: "database" },
    { label: "Write cost", icon: "queue" },
  ],
  nodes: [
    { id: "you", kind: "user", label: "Reader", x: 100, y: 150 },
    { id: "api", kind: "server", label: "Feed API", x: 300, y: 150 },
    { id: "posts", kind: "db", label: "Posts DB", x: 430, y: 40 },
    { id: "cache", kind: "cache", label: "Timelines", x: 430, y: 260 },
    { id: "graph", kind: "db", label: "Follow Graph", x: 560, y: 40 },
    { id: "fan", kind: "queue", label: "Fan-out", x: 560, y: 150 },
    { id: "rank", kind: "service", label: "Ranker", x: 560, y: 260 },
  ],
  links: [
    { id: "u-a", from: "you", to: "api" },
    { id: "a-p", from: "api", to: "posts" },
    { id: "a-c", from: "api", to: "cache" },
    { id: "a-f", from: "api", to: "fan" },
    { id: "f-c", from: "fan", to: "cache" },
    { id: "f-g", from: "fan", to: "graph" },
    { id: "c-r", from: "cache", to: "rank" },
    { id: "p-g", from: "posts", to: "graph" },
  ],
  steps: [
    {
      short: "Problem",
      title: "Open the app, see a feed",
      body: [
        "A feed shows recent posts from everyone you follow, newest and most relevant first. Assume 300 million daily users who each open the feed about 10 times a day.",
        "That is roughly 3 billion reads per day, around 35,000 per second on average and several times that at peak. Posts are far rarer, perhaps 100 million a day, so reads outnumber writes about 30 to 1.",
      ],
      callout: {
        kind: "insight",
        text: "When reads dominate, move work from the read path to the write path. A write happens once; a read of that data happens many times.",
      },
      metrics: [
        { label: "Reads / s", value: "~35,000", level: "warn" },
        { label: "Feed latency", value: "goal < 200 ms", level: "good" },
      ],
      scene: { show: ["you", "api"], hot: ["api"], bubbles: { you: "open feed" } },
    },
    {
      short: "Pull",
      title: "Fan-out on read (pull)",
      body: [
        "The simple design: when a reader opens the feed, look up everyone they follow, fetch each person's latest posts, merge them by time and return the top 20.",
        "A user following 500 accounts means 500 lookups per feed load, so 35,000 loads per second becomes 17 million post queries per second. Storage is trivial, but every read pays the full cost.",
      ],
      callout: {
        kind: "warn",
        text: "Pull is correct and simple, which makes it a fine start. It collapses under read load because the expensive scatter-gather runs on every page open.",
      },
      metrics: [
        { label: "Feed latency", value: "~1,200 ms", level: "bad" },
        { label: "DB queries", value: "500 / feed", level: "bad" },
        { label: "Reads / s", value: "~35,000", level: "warn" },
        { label: "Write cost", value: "1 insert", level: "good" },
      ],
      scene: {
        show: ["you", "api", "posts", "graph"],
        hot: ["posts"],
        flows: [
          { link: "u-a", label: "GET /feed" },
          { link: "a-p", delay: 0.5, tone: "warn", label: "500 queries" },
        ],
        badges: { posts: "scatter-gather per read" },
      },
    },
    {
      short: "Push",
      title: "Fan-out on write (push)",
      body: [
        "Flip it: when someone posts, a fan-out worker looks up their followers and pushes the new post id into each follower's precomputed timeline. A read is then one lookup of an already-built list.",
        "The write got heavier: an author with 200 followers causes 200 timeline inserts. But those happen asynchronously through a queue, off the user's critical path, while reads become fast and cheap.",
      ],
      callout: {
        kind: "tip",
        text: "Make fan-out asynchronous. The author gets an instant success after the post is saved, and followers see it a second or two later.",
      },
      metrics: [
        { label: "Feed latency", value: "~40 ms", level: "good" },
        { label: "DB queries", value: "1 / feed", level: "good" },
        { label: "Write cost", value: "200 inserts / post", level: "warn" },
      ],
      scene: {
        show: ["you", "api", "posts", "cache", "fan", "graph"],
        hot: ["fan"],
        flows: [
          { link: "a-f", label: "new post #9921" },
          { link: "f-g", delay: 0.5, label: "who follows?" },
          { link: "f-c", delay: 1.0, label: "200 inserts" },
        ],
        badges: { fan: "async workers" },
      },
    },
    {
      short: "Celebrity",
      title: "Case: an account with 20 million followers",
      chapter: { label: "Case", tone: "amber" },
      body: [
        "One post from a celebrity triggers 20 million timeline inserts. At 100,000 inserts per second the fan-out takes over three minutes, and it floods the queue so that ordinary users' posts wait behind it.",
        "Most of that work is wasted too, because many of those followers will not open the app for days. Pure push spends effort on timelines nobody reads.",
      ],
      callout: {
        kind: "warn",
        text: "Watch the follower distribution, not the average. A few huge accounts can dominate the write load of the entire system.",
      },
      metrics: [
        { label: "Write cost", value: "20M inserts / post", level: "bad" },
        { label: "Feed latency", value: "40 ms", level: "good" },
        { label: "DB queries", value: "1 / feed", level: "good" },
      ],
      scene: {
        show: ["api", "cache", "fan", "graph"],
        hot: ["fan"],
        flows: [
          { link: "f-g", tone: "warn", label: "20M followers" },
          { link: "f-c", tone: "warn", delay: 0.6, label: "3 minute backlog" },
        ],
        badges: { fan: "queue backed up" },
      },
    },
    {
      short: "Hybrid",
      title: "Hybrid: push for most, pull for the few",
      body: [
        "Set a threshold, for example 100,000 followers. Normal accounts are pushed into timelines as before. Celebrity posts are not fanned out; they stay in the posts store.",
        "At read time the API loads the reader's precomputed timeline, fetches recent posts from the handful of celebrities they follow, and merges the two. A reader follows maybe 5 celebrities, so that is 5 extra lookups, not 500.",
      ],
      callout: {
        kind: "insight",
        text: "The hybrid caps the worst case on both sides: write cost is bounded by the threshold, and read cost by the number of celebrities a person follows.",
      },
      metrics: [
        { label: "Feed latency", value: "~60 ms", level: "good" },
        { label: "DB queries", value: "6 / feed", level: "good" },
        { label: "Write cost", value: "<= 100K inserts / post", level: "warn" },
      ],
      scene: {
        show: ["you", "api", "posts", "cache"],
        hot: ["api"],
        flows: [
          { link: "a-c", label: "timeline ids" },
          { link: "a-p", delay: 0.5, label: "5 celeb accounts" },
          { link: "u-a", reverse: true, tone: "res", delay: 1.1, label: "merged feed" },
        ],
        badges: { cache: "precomputed", posts: "celebs pulled" },
      },
    },
    {
      short: "Timeline cache",
      title: "What the timeline cache stores",
      body: [
        "A timeline is a list per user of post ids with their timestamps, kept in an in-memory store. Ids only, not full posts: 8 bytes each means 800 entries is about 6.4 KB per user.",
        "For 300 million users that is roughly 2 TB, easily spread over a cluster. Cap each list at a few hundred recent entries, and when someone scrolls deeper, fall back to the pull path.",
      ],
      callout: {
        kind: "tip",
        text: "Store ids, then hydrate them: fetch post bodies, authors and like counts from a separate cache by id. One post is stored once, however many timelines point to it.",
      },
      metrics: [
        { label: "Feed latency", value: "~45 ms", level: "good" },
        { label: "DB queries", value: "0 (cache hit)", level: "good" },
        { label: "Reads / s", value: "35,000 on cache", level: "good" },
      ],
      scene: {
        show: ["you", "api", "cache"],
        hot: ["cache"],
        flows: [
          { link: "a-c", label: "LRANGE feed:42 0 19" },
          { link: "a-c", reverse: true, tone: "res", delay: 0.7, label: "20 post ids" },
        ],
        badges: { cache: "800 ids per user" },
      },
    },
    {
      short: "Ranking",
      title: "Rank instead of sorting by time",
      body: [
        "Pure chronological order buries the posts you care about under noise. So the API takes the few hundred candidate ids from the timeline and asks a ranker to score each one.",
        "Features include the author's closeness to you, post age, past engagement and predicted interest. Keep ranking cheap, a few milliseconds for 300 candidates, and compute heavy model features offline.",
      ],
      callout: {
        kind: "insight",
        text: "Ranking is a second stage over a cached candidate set. Retrieval narrows millions of posts to hundreds cheaply; ranking spends real effort only on those hundreds.",
      },
      metrics: [
        { label: "Feed latency", value: "~70 ms", level: "good" },
        { label: "DB queries", value: "0 (cache hit)", level: "good" },
      ],
      scene: {
        show: ["you", "api", "cache", "rank"],
        hot: ["rank"],
        flows: [
          { link: "c-r", label: "300 candidates" },
          { link: "c-r", reverse: true, tone: "res", delay: 0.8, label: "scored, top 20" },
        ],
        badges: { rank: "5 ms for 300 posts" },
      },
    },
    {
      short: "Cache loss",
      title: "Case: a timeline cache node dies",
      chapter: { label: "Failure", tone: "red" },
      body: [
        "A node holding 10 million timelines restarts empty. Those users now miss the cache, and the fallback is the slow pull path: 500 queries each, all at once.",
        "Mitigate it two ways: replicate timeline shards so a single failure rarely loses data, and rebuild lazily with a lock so only one request per user does the expensive merge while others wait on the result.",
      ],
      callout: {
        kind: "warn",
        text: "Rate-limit rebuilds. Without that, recovering from the failure can take down the posts database and turn a partial outage into a full one.",
      },
      metrics: [
        { label: "Feed latency", value: "~900 ms", level: "bad" },
        { label: "DB queries", value: "500 / rebuild", level: "bad" },
        { label: "Reads / s", value: "35,000", level: "warn" },
      ],
      scene: {
        show: ["you", "api", "posts", "cache", "graph"],
        down: ["cache"],
        hot: ["posts"],
        flows: [
          { link: "a-c", tone: "warn", label: "miss" },
          { link: "a-p", delay: 0.6, tone: "warn", label: "rebuild: 500 queries" },
        ],
        badges: { posts: "load spike" },
      },
    },
    {
      short: "Recap",
      title: "The feed design in one picture",
      body: [
        "Posts are stored once. A fan-out queue pushes ids into follower timelines for normal accounts; celebrity posts are pulled and merged at read time. A cache serves timelines, and a ranker orders a few hundred candidates.",
        "Decision rule: if reads outnumber writes and follower counts are bounded, push; where a write would fan out to millions, pull. Pick the threshold from your own follower distribution.",
      ],
      callout: {
        kind: "tip",
        text: "Always state the numbers when defending a choice: 35,000 reads per second against 1,200 posts per second is what makes push worth its write cost.",
      },
      metrics: [
        { label: "Feed latency", value: "~70 ms", level: "good" },
        { label: "Reads / s", value: "35,000", level: "good" },
        { label: "DB queries", value: "~0 per feed", level: "good" },
        { label: "Write cost", value: "bounded by threshold", level: "good" },
      ],
      scene: {
        show: ["you", "api", "posts", "cache", "fan", "graph", "rank"],
        badges: {
          fan: "push <= 100K",
          posts: "pull for celebs",
          cache: "ids only",
          rank: "top 20",
        },
      },
    },
  ],
};
