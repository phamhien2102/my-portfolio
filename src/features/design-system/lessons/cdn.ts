import type { Lesson } from "../lib/types";

export const cdn: Lesson = {
  id: "cdn",
  title: "Content Delivery",
  summary: "Put copies of your content near users so most requests never travel to the origin.",
  minutes: 10,
  level: "beginner",
  goals: [
    "Why distance sets a floor on latency",
    "How edge caches serve a copy close to the user",
    "How cache hits, misses and TTLs behave",
    "Why purging and versioned file names matter",
    "Cases: a traffic spike and a stale deploy",
  ],
  takeaways: [
    "A CDN trades freshness for speed: copies live near users and expire on a timer.",
    "The hit ratio decides everything, since each hit is a request the origin never sees.",
    "Version your file names so a deploy never depends on purging caches around the world.",
  ],
  hud: [
    { label: "Distance", icon: "globe" },
    { label: "Latency", icon: "timer" },
    { label: "Origin load", icon: "server" },
    { label: "Hit ratio", icon: "gauge" },
    { label: "Bandwidth", icon: "download" },
  ],
  nodes: [
    { id: "you", kind: "user", label: "you", x: 100, y: 160 },
    { id: "edgeA", kind: "cache", label: "Edge", sub: "near you", x: 330, y: 60 },
    { id: "edgeB", kind: "cache", label: "Edge 2", sub: "other region", x: 330, y: 260 },
    { id: "origin", kind: "server", label: "Origin", x: 570, y: 160 },
    { id: "store", kind: "db", label: "Storage", x: 570, y: 40 },
  ],
  links: [
    { id: "direct", from: "you", to: "origin" },
    { id: "ua", from: "you", to: "edgeA" },
    { id: "ao", from: "edgeA", to: "origin" },
    { id: "bo", from: "edgeB", to: "origin" },
    { id: "os", from: "origin", to: "store" },
  ],
  steps: [
    {
      short: "Far away",
      title: "Every request flies to one server",
      body: [
        "Your origin server sits in one data center. A shopper on another continent has to reach it for every image, script and page.",
        "Light in fibre covers about 200 km per millisecond, and real routes are not straight. A 9,000 km trip costs roughly 150 ms round trip before the server does any work.",
      ],
      callout: {
        kind: "insight",
        text: "You can buy a faster server, but you cannot buy a faster speed of light. Distance is a cost only placement can fix.",
      },
      metrics: [
        { label: "Distance", value: "9,000 km", level: "bad" },
        { label: "Latency", value: "380 ms", level: "bad" },
        { label: "Origin load", value: "100%", level: "warn" },
      ],
      scene: {
        show: ["you", "origin"],
        hot: ["origin"],
        flows: [
          { link: "direct", label: "GET /logo.png" },
          { link: "direct", reverse: true, tone: "res", delay: 0.9, label: "150 ms away" },
        ],
        badges: { you: "9,000 km away" },
      },
    },
    {
      short: "Edge copies",
      title: "Keep copies near the users",
      body: [
        "A content delivery network runs hundreds of small cache servers, called edge locations, in cities around the world. Each one can hold copies of your files.",
        "The user's request is steered to the nearest edge, usually through DNS or anycast routing, instead of to your origin.",
      ],
      metrics: [
        { label: "Distance", value: "40 km", level: "good" },
        { label: "Latency", value: "—", level: "warn" },
      ],
      scene: {
        show: ["you", "edgeA", "edgeB", "origin"],
        hot: ["edgeA"],
        flows: [{ link: "ua", label: "nearest edge" }],
        badges: { edgeA: "40 km from you", edgeB: "serves its region" },
      },
    },
    {
      short: "First miss",
      title: "The first request is a miss",
      body: [
        "A new edge starts empty. When the first visitor asks for `/logo.png`, the edge does not have it, so it fetches the file from the origin and stores a copy.",
        "That visitor pays for the long trip once. The edge now holds the file for everyone nearby.",
      ],
      callout: {
        kind: "warn",
        text: "A miss is slower than having no CDN at all, because it adds an extra hop. CDNs pay off only when files are requested many times.",
      },
      metrics: [
        { label: "Distance", value: "9,000 km", level: "bad" },
        { label: "Latency", value: "420 ms", level: "bad" },
        { label: "Origin load", value: "100%", level: "warn" },
        { label: "Hit ratio", value: "0%", level: "bad" },
      ],
      scene: {
        show: ["you", "edgeA", "origin"],
        hot: ["edgeA"],
        flows: [
          { link: "ua", label: "MISS" },
          { link: "ao", delay: 0.8, label: "fetch from origin" },
          { link: "ao", reverse: true, tone: "res", delay: 1.8 },
        ],
        badges: { edgeA: "storing a copy" },
      },
    },
    {
      short: "Hit",
      title: "The second request is a hit",
      body: [
        "The next visitor near that edge gets the file straight from the cache. The origin never hears about it.",
        "The trip drops from 150 ms to about 15 ms, and the origin does zero work for this request.",
      ],
      metrics: [
        { label: "Distance", value: "40 km", level: "good" },
        { label: "Latency", value: "25 ms", level: "good" },
        { label: "Origin load", value: "10%", level: "good" },
        { label: "Hit ratio", value: "90%", level: "good" },
        { label: "Bandwidth", value: "-90% origin", level: "good" },
      ],
      scene: {
        show: ["you", "edgeA", "origin"],
        hot: ["edgeA"],
        flows: [
          { link: "ua", label: "GET /logo.png" },
          { link: "ua", reverse: true, tone: "res", delay: 0.8, label: "HIT · 15 ms" },
        ],
        badges: { edgeA: "cache hit", origin: "idle" },
      },
    },
    {
      short: "TTL",
      title: "Copies expire on a timer",
      body: [
        "The origin tells the edge how long a copy stays valid with a header such as `Cache-Control: max-age=86400`. When the time runs out, the edge asks the origin again.",
        "Often it can send a cheap check (`If-None-Match`) and get back `304 Not Modified` with no body.",
      ],
      callout: {
        kind: "tip",
        text: "Long TTLs for files that rarely change (images, fonts, bundles). Short or zero TTLs for personal or fast-moving pages.",
      },
      metrics: [
        { label: "Latency", value: "25 ms", level: "good" },
        { label: "Origin load", value: "8%", level: "good" },
        { label: "Hit ratio", value: "92%", level: "good" },
      ],
      scene: {
        show: ["you", "edgeA", "origin"],
        hot: ["edgeA"],
        flows: [
          { link: "ao", label: "still fresh?" },
          { link: "ao", reverse: true, tone: "res", delay: 0.8, label: "304 Not Modified" },
        ],
        bubbles: { edgeA: "max-age=86400" },
        badges: { edgeA: "expires in 24 h" },
      },
    },
    {
      short: "Purge",
      title: "Changing a file means purging",
      body: [
        "You fix a typo in `/terms.html`, but every edge still holds the old copy until its TTL runs out, which could be a day.",
        "A purge call tells the CDN to drop the file everywhere. It usually finishes in seconds, yet it is one more thing that can fail halfway.",
      ],
      callout: {
        kind: "warn",
        text: "Never rely on purges for correctness. A region that missed the purge keeps serving old content until the TTL expires.",
      },
      metrics: [
        { label: "Hit ratio", value: "92% → 0%", level: "warn" },
        { label: "Origin load", value: "briefly high", level: "warn" },
      ],
      scene: {
        show: ["origin", "edgeA", "edgeB"],
        hot: ["edgeA", "edgeB"],
        flows: [
          { link: "ao", reverse: true, tone: "warn", label: "PURGE /terms.html" },
          { link: "bo", reverse: true, tone: "warn" },
        ],
        badges: { edgeA: "copy dropped", edgeB: "copy dropped" },
      },
    },
    {
      short: "Flash crowd",
      title: "Case: a viral launch",
      chapter: { label: "Case", tone: "amber" },
      body: [
        "A product video hits the front page of a news site and traffic jumps from 200 to 50,000 requests per second. A single origin handling 2,000 requests per second would fall over.",
        "With a 98% hit ratio, only about 1,000 requests per second reach the origin. The edges absorb the rest, and the origin stays up.",
      ],
      callout: {
        kind: "insight",
        text: "A CDN is also a shield. During spikes it protects the origin, which is often the real reason to put one in front.",
      },
      metrics: [
        { label: "Latency", value: "30 ms", level: "good" },
        { label: "Origin load", value: "1,000 rps", level: "warn" },
        { label: "Hit ratio", value: "98%", level: "good" },
        { label: "Bandwidth", value: "49,000 rps at edge", level: "good" },
      ],
      scene: {
        show: ["you", "edgeA", "edgeB", "origin"],
        hot: ["edgeA", "edgeB"],
        flows: [
          { link: "ua", label: "50,000 req/s" },
          { link: "ao", delay: 0.4, label: "1,000 req/s" },
          { link: "bo", delay: 0.4 },
        ],
        badges: { origin: "calm", edgeA: "absorbs 98%" },
      },
    },
    {
      short: "Versioned",
      title: "Case: a stale script after deploy",
      chapter: { label: "Case", tone: "amber" },
      body: [
        "You ship a new `app.js`, but some users still run the cached old one against your new API. Purging is racy, and browsers keep their own copies too.",
        "The robust fix is to put a hash in the file name: `app.3f9c1a.js`. A new build means a new URL, so there is nothing to purge and old and new coexist cleanly.",
      ],
      callout: {
        kind: "tip",
        text: "Hashed file names let you cache assets for a year (`immutable`). Only the small HTML page that references them needs a short TTL.",
      },
      metrics: [
        { label: "Hit ratio", value: "97%", level: "good" },
        { label: "Origin load", value: "3%", level: "good" },
      ],
      scene: {
        show: ["you", "edgeA", "origin"],
        hot: ["edgeA"],
        flows: [
          { link: "ua", label: "GET app.3f9c1a.js" },
          { link: "ua", reverse: true, tone: "res", delay: 0.8, label: "new file, new URL" },
        ],
        bubbles: { you: "app.3f9c1a.js" },
        badges: { edgeA: "old app.7b20de.js idle" },
      },
    },
    {
      short: "Recap",
      title: "When a CDN helps",
      body: [
        "A CDN shortens the path (edge instead of origin), cuts origin load, and absorbs spikes. A typical split is 15 to 30 ms for a hit versus 150 ms or more for a trip to the origin.",
        "Use it for static files and cacheable pages, set TTLs by how often content changes, and name files by content hash. Skip it for per-user data, or cache it only with great care.",
      ],
      metrics: [
        { label: "Distance", value: "40 km", level: "good" },
        { label: "Latency", value: "25 ms", level: "good" },
        { label: "Origin load", value: "3%", level: "good" },
        { label: "Hit ratio", value: "97%", level: "good" },
      ],
      scene: {
        show: ["you", "edgeA", "origin"],
        badges: { you: "25 ms", edgeA: "97% hits", origin: "3% of traffic" },
      },
    },
  ],
};
