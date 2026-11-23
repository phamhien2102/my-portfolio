import type { Lesson } from "../lib/types";

export const files: Lesson = {
  id: "files",
  title: "Files & Media",
  summary: "Store, upload and deliver large files without choking your app servers.",
  minutes: 14,
  level: "intermediate",
  goals: [
    "Why files live in object storage, not the database",
    "How presigned URLs skip your server",
    "How chunked uploads survive bad networks",
    "Why a CDN and async processing matter for media",
    "Cases: a 4 GB video and a viral image",
  ],
  takeaways: [
    "Store bytes in object storage, keep only metadata and a key in the database.",
    "Let clients upload and download directly using presigned URLs, and serve popular files from a CDN.",
    "Slow work such as resizing and transcoding belongs in a background pipeline, never in the request.",
  ],
  hud: [
    { label: "Upload path", icon: "download" },
    { label: "App load", icon: "server" },
    { label: "Latency", icon: "timer" },
    { label: "Cost", icon: "gauge" },
  ],
  nodes: [
    { id: "you", kind: "user", label: "user", x: 100, y: 150 },
    { id: "api", kind: "server", label: "API", x: 330, y: 40 },
    { id: "meta", kind: "db", label: "Metadata", x: 560, y: 40 },
    { id: "store", kind: "db", label: "Object Store", x: 560, y: 170 },
    { id: "cdn", kind: "cache", label: "CDN", x: 330, y: 260 },
  ],
  links: [
    { id: "you-api", from: "you", to: "api" },
    { id: "api-meta", from: "api", to: "meta" },
    { id: "api-store", from: "api", to: "store" },
    { id: "you-store", from: "you", to: "store" },
    { id: "cdn-store", from: "cdn", to: "store" },
    { id: "you-cdn", from: "you", to: "cdn" },
  ],
  steps: [
    {
      short: "Problem",
      title: "Users want to upload a photo",
      body: [
        "A profile photo is `3 MB`, a video can be `4 GB`. Files are big, bursty and mostly read-only after they arrive.",
        "The obvious design sends the file to your API, which writes it somewhere. It works for a demo. Let's see why it breaks.",
      ],
      callout: {
        kind: "insight",
        text: "Web servers are good at short requests. A single slow upload can hold a connection for minutes.",
      },
      metrics: [
        { label: "Upload path", value: "via API", level: "warn" },
        { label: "App load", value: "low", level: "good" },
      ],
      scene: {
        show: ["you", "api"],
        hot: ["you"],
        flows: [{ link: "you-api", label: "photo.jpg 3 MB" }],
        bubbles: { you: "upload photo" },
      },
    },
    {
      short: "Not the DB",
      title: "Do not put files in the database",
      body: [
        "Storing blobs in a relational table bloats backups, slows replication and wastes expensive disk and memory on bytes that never need a query.",
        "Instead keep the bytes in object storage (S3 style): cheap, effectively unlimited, replicated across machines, and addressed by a key like `avatars/42.jpg`. The database keeps only the key, size, owner and content type.",
      ],
      callout: {
        kind: "tip",
        text: "Object storage is typically designed for 99.999999999% durability, far beyond a single database disk.",
      },
      metrics: [
        { label: "Upload path", value: "via API", level: "warn" },
        { label: "App load", value: "high", level: "bad" },
        { label: "Cost", value: "low", level: "good" },
      ],
      scene: {
        show: ["you", "api", "meta", "store"],
        hot: ["store", "meta"],
        flows: [
          { link: "api-store", label: "bytes" },
          { link: "api-meta", delay: 0.6, label: "key, size, owner" },
        ],
        badges: { store: "avatars/42.jpg", meta: "rows only" },
      },
    },
    {
      short: "Bottleneck",
      title: "The API becomes a pipe",
      body: [
        "Proxying every byte means each upload ties up a server thread and its bandwidth twice: once in, once out to storage. A hundred simultaneous `100 MB` uploads move 10 GB through machines that do nothing useful with it.",
        "You would be scaling expensive app servers just to forward bytes.",
      ],
      callout: {
        kind: "warn",
        text: "If your autoscaling is driven by upload traffic, you are paying compute prices for a bandwidth problem.",
      },
      metrics: [
        { label: "Upload path", value: "via API", level: "bad" },
        { label: "App load", value: "10 GB", level: "bad" },
        { label: "Latency", value: "slow", level: "bad" },
        { label: "Cost", value: "high", level: "bad" },
      ],
      scene: {
        show: ["you", "api", "store"],
        hot: ["api"],
        flows: [
          { link: "you-api", tone: "warn", label: "100 MB x 100" },
          { link: "api-store", tone: "warn", delay: 0.5, label: "forwarded again" },
        ],
        badges: { api: "saturated" },
      },
    },
    {
      short: "Presigned",
      title: "Presigned URLs: go direct",
      body: [
        "The client asks the API for permission to upload. The API checks the user, then returns a presigned URL: a link to one exact key that expires in a few minutes.",
        "The client then sends the bytes straight to object storage. The API did a tiny `1 KB` exchange instead of moving the file.",
      ],
      callout: {
        kind: "tip",
        text: "Put limits in the signature: allowed content type, maximum size and a short expiry such as 5 minutes.",
      },
      metrics: [
        { label: "Upload path", value: "direct", level: "good" },
        { label: "App load", value: "tiny", level: "good" },
        { label: "Latency", value: "good", level: "good" },
        { label: "Cost", value: "low", level: "good" },
      ],
      scene: {
        show: ["you", "api", "store"],
        hot: ["store"],
        flows: [
          { link: "you-api", label: "may I upload?" },
          { link: "you-api", reverse: true, tone: "res", delay: 0.6, label: "signed URL, 5 min" },
          { link: "you-store", delay: 1.3, label: "PUT file" },
        ],
      },
    },
    {
      short: "Chunks",
      title: "Chunked, resumable uploads",
      body: [
        "A `4 GB` upload on a phone will be interrupted. Split it into parts of, say, `8 MB`, upload them in parallel and track which parts arrived.",
        "After a dropped connection the client retries only the missing parts. A final call asks storage to stitch them into one object.",
      ],
      callout: {
        kind: "insight",
        text: "Parts also let you retry cheaply and use more bandwidth, because several TCP connections beat one.",
      },
      metrics: [
        { label: "Upload path", value: "direct", level: "good" },
        { label: "Latency", value: "resumable", level: "good" },
        { label: "Cost", value: "low", level: "good" },
      ],
      scene: {
        show: ["you", "store"],
        hot: ["store"],
        flows: [
          { link: "you-store", label: "part 1 of 512" },
          { link: "you-store", delay: 0.3 },
          { link: "you-store", delay: 0.6 },
        ],
        badges: { store: "parts 1-3 stored", you: "resume from part 4" },
      },
    },
    {
      short: "Confirm",
      title: "Confirm and record metadata",
      body: [
        "Storage then notifies your system (an event or a client callback) that the object exists. Only now do you insert the metadata row and mark the file `ready`.",
        "Never trust the client's claim alone: verify size and type server side, and keep new files private until checks pass.",
      ],
      callout: {
        kind: "warn",
        text: "Unverified uploads can be anything. Scan for malware and sniff the real file type; do not rely on the extension.",
      },
      metrics: [
        { label: "Upload path", value: "direct", level: "good" },
        { label: "App load", value: "tiny", level: "good" },
        { label: "Latency", value: "good", level: "good" },
      ],
      scene: {
        show: ["you", "api", "meta", "store"],
        hot: ["meta"],
        flows: [
          { link: "api-store", reverse: true, tone: "res", label: "object created" },
          { link: "api-meta", delay: 0.7, label: "status = ready" },
        ],
        badges: { meta: "ready" },
      },
    },
    {
      short: "Download",
      title: "Serving files with a CDN",
      body: [
        "Reading straight from object storage works but is slow for faraway users, and you pay for each request and byte out. A CDN keeps copies at edge locations near users.",
        "A hit is served in roughly `20 ms` from nearby; a miss fetches once from storage and then serves everyone after. Popular images reach a hit rate above 95%.",
      ],
      callout: {
        kind: "tip",
        text: "Use content-hashed file names like `logo.9af3.png` so you can cache them for a year and never serve a stale copy.",
      },
      metrics: [
        { label: "Latency", value: "20 ms", level: "good" },
        { label: "App load", value: "none", level: "good" },
        { label: "Cost", value: "low", level: "good" },
      ],
      scene: {
        show: ["you", "cdn", "store"],
        hot: ["cdn"],
        flows: [
          { link: "you-cdn", label: "GET /logo.9af3.png" },
          { link: "you-cdn", reverse: true, tone: "res", delay: 0.7, label: "hit, 20 ms" },
          { link: "cdn-store", delay: 1.4, label: "miss: fetch once" },
        ],
        badges: { cdn: "95% hit rate" },
      },
    },
    {
      short: "Big video",
      title: "Case: a 4 GB video",
      chapter: { label: "Case", tone: "amber" },
      body: [
        "Raw video is too large and too varied to play directly. After the upload completes, a background worker transcodes it into several resolutions and cuts each into 4 second segments.",
        "Players pick a rendition to match bandwidth and fetch segments over plain HTTP from the CDN. Transcoding may take minutes, so the user sees `processing` until it finishes.",
      ],
      callout: {
        kind: "insight",
        text: "Resizing, thumbnails and transcoding are the same pattern: an upload event goes on a queue and workers do the heavy part later.",
      },
      metrics: [
        { label: "Upload path", value: "chunked", level: "good" },
        { label: "App load", value: "none", level: "good" },
        { label: "Latency", value: "minutes", level: "warn" },
        { label: "Cost", value: "medium", level: "warn" },
      ],
      scene: {
        show: ["you", "api", "meta", "store"],
        hot: ["store"],
        flows: [
          { link: "you-store", label: "4 GB in 512 parts" },
          { link: "api-store", delay: 0.6, label: "worker: transcode" },
        ],
        badges: { meta: "status: processing", store: "360p, 720p, 1080p" },
      },
    },
    {
      short: "Viral image",
      title: "Case: one image goes viral",
      chapter: { label: "Case", tone: "amber" },
      body: [
        "A post is shared and one `500 KB` image is requested 20,000 times a second, about `10 GB/s`. Without a CDN every request hits object storage and your origin bill and latency both spike.",
        "With one, the first request fills the edge cache and nearly all the rest never reach storage at all.",
      ],
      metrics: [
        { label: "Latency", value: "20 ms", level: "good" },
        { label: "App load", value: "none", level: "good" },
        { label: "Cost", value: "flat", level: "good" },
      ],
      scene: {
        show: ["you", "cdn", "store"],
        hot: ["cdn"],
        flows: [
          { link: "you-cdn", reverse: true, tone: "res", label: "20,000 req/s" },
          { link: "you-cdn", reverse: true, tone: "res", delay: 0.3 },
          { link: "cdn-store", delay: 0.9, label: "1 origin fetch" },
        ],
        badges: { cdn: "99.9% hit", store: "almost idle" },
      },
    },
    {
      short: "Recap",
      title: "The file pipeline",
      body: [
        "Ask the API for a presigned URL, upload in parts straight to object storage, record metadata, process in the background, and serve through a CDN.",
        "Your app servers only handle tiny control messages, so they stay cheap and fast no matter how large the files get.",
      ],
      callout: {
        kind: "tip",
        text: "Decision rule: bytes go to storage and the CDN, decisions go to the API, slow work goes to a queue.",
      },
      metrics: [
        { label: "Upload path", value: "direct", level: "good" },
        { label: "App load", value: "tiny", level: "good" },
        { label: "Latency", value: "20 ms", level: "good" },
        { label: "Cost", value: "low", level: "good" },
      ],
      scene: {
        show: ["you", "api", "meta", "store", "cdn"],
        badges: { api: "control only", store: "all the bytes", cdn: "edge reads", meta: "keys" },
      },
    },
  ],
};
