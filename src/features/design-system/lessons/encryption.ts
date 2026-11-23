import type { Lesson } from "../lib/types";

export const encryption: Lesson = {
  id: "encryption",
  title: "Encryption & Secrets",
  summary:
    "Protect data on the wire and on disk, and keep the keys and passwords themselves out of harm's way.",
  minutes: 13,
  level: "intermediate",
  goals: [
    "Encryption in transit and at rest, and what each protects",
    "Symmetric versus asymmetric keys",
    "Envelope encryption with a key service",
    "How to store, rotate and never leak secrets",
    "Hashing versus encryption",
  ],
  takeaways: [
    "Encrypt in transit with TLS and at rest with managed keys, but remember encryption only moves the problem to the key.",
    "Use envelope encryption: a key service guards a master key and hands out small data keys.",
    "Keep secrets out of code, rotate them on a schedule, and assume any leaked secret is already in use.",
  ],
  hud: [
    { label: "In transit", icon: "link" },
    { label: "At rest", icon: "database" },
    { label: "Key exposure", icon: "alert" },
    { label: "Overhead", icon: "timer" },
  ],
  nodes: [
    { id: "you", kind: "user", label: "browser", x: 100, y: 150 },
    { id: "web", kind: "server", label: "Web Server", x: 310, y: 150 },
    { id: "kms", kind: "service", label: "Key Service", sub: "KMS", x: 500, y: 40 },
    { id: "db", kind: "db", label: "Database", x: 500, y: 260 },
    { id: "bak", kind: "queue", label: "Backups", x: 710, y: 260 },
  ],
  links: [
    { id: "cw", from: "you", to: "web" },
    { id: "wk", from: "web", to: "kms" },
    { id: "wd", from: "web", to: "db" },
    { id: "kd", from: "kms", to: "db" },
    { id: "db_bak", from: "db", to: "bak" },
  ],
  steps: [
    {
      short: "Who can read?",
      title: "Data passes through many hands",
      body: [
        "A card number crosses Wi-Fi, a router, an ISP and a data centre before it lands on a disk. That disk is later copied into backups, and the backups are copied again.",
        "Any of those places can be watched, stolen or misconfigured. Encryption makes the bytes useless to everyone except the holder of the key.",
      ],
      callout: {
        kind: "insight",
        text: "Two separate threats: someone listening on the way (in transit), and someone getting the stored copy (at rest). Each needs its own protection.",
      },
      metrics: [
        { label: "In transit", value: "plain text", level: "bad" },
        { label: "At rest", value: "plain text", level: "bad" },
        { label: "Key exposure", value: "n/a", level: "warn" },
      ],
      scene: {
        show: ["you", "web", "db"],
        flows: [
          { link: "cw", tone: "warn", label: "card 4111 1111..." },
          { link: "wd", tone: "warn", delay: 0.8, label: "card 4111 1111..." },
        ],
        badges: { web: "anyone on the path can read" },
      },
    },
    {
      short: "TLS",
      title: "In transit: TLS between every pair",
      body: [
        "TLS first has the server prove its identity with a certificate, then both sides agree a fresh session key. After that, traffic is encrypted and tamper-evident. The handshake costs one or two round trips, then the cost per request is tiny.",
        'Use it for browser traffic, and also between your own services and to the database. A "private" network is not a security boundary once something inside is compromised.',
      ],
      callout: {
        kind: "tip",
        text: "Send `Strict-Transport-Security` so browsers refuse plain HTTP, and renew certificates automatically. An expired certificate is an outage.",
      },
      metrics: [
        { label: "In transit", value: "TLS 1.3", level: "good" },
        { label: "At rest", value: "plain text", level: "bad" },
        { label: "Overhead", value: "+1 round trip", level: "warn" },
      ],
      scene: {
        show: ["you", "web", "db"],
        hot: ["web"],
        flows: [
          { link: "cw", tone: "hand", label: "certificate + key agreement" },
          { link: "cw", delay: 0.8, label: "encrypted bytes" },
          { link: "wd", delay: 1.4, label: "TLS to the database" },
        ],
        badges: { web: "cert for shop.example" },
      },
    },
    {
      short: "Two kinds",
      title: "Symmetric and asymmetric keys",
      body: [
        "Symmetric encryption such as AES uses one key to lock and unlock. It is fast, hundreds of megabytes per second per core with hardware support, so it does the bulk work.",
        "Asymmetric encryption uses a public key to lock and a private key to unlock, so strangers can reach you without a shared secret. It is far slower, so it is used briefly, to agree on a symmetric key or to sign data.",
      ],
      callout: {
        kind: "insight",
        text: "That is exactly what TLS does: asymmetric maths to set up, then a fast symmetric cipher for the actual data.",
      },
      metrics: [
        { label: "In transit", value: "TLS 1.3", level: "good" },
        { label: "Overhead", value: "AES: negligible", level: "good" },
      ],
      scene: {
        show: ["you", "web"],
        hot: ["you", "web"],
        flows: [
          { link: "cw", tone: "hand", label: "public key: agree a secret" },
          { link: "cw", reverse: true, delay: 0.8, label: "AES from now on" },
        ],
        badges: { you: "same session key", web: "same session key" },
      },
    },
    {
      short: "At rest",
      title: "At rest: encrypt what you store",
      body: [
        "Disk, database and backup encryption mean a stolen drive, a leaked snapshot or a decommissioned server reveals only noise. Most clouds offer this as a checkbox, typically adding under 5 percent overhead.",
        "Know what it does not cover. A running application reads decrypted data, so a SQL injection or a stolen app credential still returns everything. For especially sensitive fields, encrypt in the application as well.",
      ],
      callout: {
        kind: "warn",
        text: "Disk encryption protects against lost hardware, not against a compromised application. Do not describe it as more than that.",
      },
      metrics: [
        { label: "In transit", value: "TLS 1.3", level: "good" },
        { label: "At rest", value: "AES-256", level: "good" },
        { label: "Overhead", value: "< 5%", level: "good" },
      ],
      scene: {
        show: ["web", "db", "bak"],
        hot: ["db", "bak"],
        flows: [
          { link: "wd", label: "plain in memory" },
          { link: "db_bak", delay: 0.8, label: "encrypted snapshot" },
        ],
        badges: { db: "disk encrypted", bak: "encrypted too" },
      },
    },
    {
      short: "Key problem",
      title: "Encryption just moves the problem to the key",
      body: [
        "If the key is stored next to the data, a thief who takes the disk takes the key too, and the encryption achieved nothing. The key needs its own, stronger protection and its own access rules.",
        "That means a dedicated key service, ideally backed by hardware that never lets the master key leave. Applications ask it to do cryptographic work instead of holding keys themselves.",
      ],
      callout: {
        kind: "warn",
        text: '"Encrypted" with the key in the same repo, bucket or config file is not encrypted in any useful sense.',
      },
      metrics: [
        { label: "At rest", value: "AES-256", level: "good" },
        { label: "Key exposure", value: "key beside data", level: "bad" },
      ],
      scene: {
        show: ["web", "db", "kms"],
        hot: ["kms"],
        down: ["db"],
        badges: { db: "key stored on same disk", kms: "keys live here instead" },
      },
    },
    {
      short: "Envelope",
      title: "Envelope encryption",
      body: [
        "Each record or file gets its own random data key, used for the fast AES work. The key service then encrypts that data key under a master key, and the wrapped copy is stored next to the data.",
        "To read, the app sends the wrapped key to the service, which unwraps it if policy allows. The master key never leaves, calls are small and about 5 ms, and re-protecting data means re-wrapping tiny keys, not rewriting terabytes.",
      ],
      callout: {
        kind: "tip",
        text: "Cache unwrapped data keys in memory for a short time to avoid a service call on every read, and never write them to disk.",
      },
      metrics: [
        { label: "At rest", value: "per-record keys", level: "good" },
        { label: "Key exposure", value: "master key never leaves", level: "good" },
        { label: "Overhead", value: "~5 ms per unwrap", level: "warn" },
      ],
      scene: {
        show: ["web", "db", "kms"],
        hot: ["kms"],
        flows: [
          { link: "wk", label: "unwrap data key" },
          { link: "wk", reverse: true, tone: "res", delay: 0.8, label: "data key" },
          { link: "wd", delay: 1.6, label: "decrypt the record" },
        ],
        badges: { kms: "master key in hardware", db: "data + wrapped key" },
      },
    },
    {
      short: "Secrets",
      title: "Keep secrets out of code, and rotate them",
      body: [
        "Database passwords, API keys and signing keys should come from a secrets manager or the platform's secret store, injected at runtime. Never commit them, bake them into images, or print them in logs.",
        "Rotate on a schedule, such as every 90 days, and immediately after any suspicion. Short-lived credentials issued per workload, valid for an hour, shrink the damage window from years to minutes.",
      ],
      callout: {
        kind: "tip",
        text: "Support two valid versions of a secret at once during rotation, so deployments do not fail in the gap between old and new.",
      },
      metrics: [
        { label: "Key exposure", value: "1 hour window", level: "good" },
        { label: "Overhead", value: "fetch at startup", level: "good" },
      ],
      scene: {
        show: ["web", "kms", "db"],
        hot: ["web"],
        flows: [
          { link: "wk", label: "fetch db password" },
          { link: "wk", reverse: true, tone: "res", delay: 0.8, label: "short-lived credential" },
          { link: "wd", delay: 1.6, label: "connect with it" },
        ],
        badges: { web: "nothing secret in code" },
      },
    },
    {
      short: "Leaked key",
      title: "Case: an API key pushed to a public repo",
      chapter: { label: "Case", tone: "amber" },
      body: [
        "A developer commits `AWS_SECRET=...` by accident. Automated scanners find such keys within minutes, and an attacker can run up thousands of dollars of compute before anyone notices.",
        "Deleting the commit is not enough, because history and forks keep it. Revoke and replace the key first, then audit its usage, then clean the repository.",
      ],
      callout: {
        kind: "warn",
        text: "Treat any secret that has been in a repo, ticket, chat or log as public. Rotation is the only real fix.",
      },
      metrics: [
        { label: "Key exposure", value: "public", level: "bad" },
        { label: "At rest", value: "readable by thief", level: "bad" },
      ],
      scene: {
        show: ["you", "web", "db"],
        hot: ["web"],
        down: ["db"],
        flows: [
          { link: "cw", tone: "warn", label: "stolen key, valid login" },
          { link: "wd", tone: "warn", delay: 0.8, label: "dump everything" },
        ],
        badges: { you: "attacker", web: "key leaked in git" },
      },
    },
    {
      short: "Hash or not",
      title: "Hashing is not encryption",
      body: [
        "Encryption is reversible with the key. A hash is a one-way fingerprint, so use it when you only need to compare, as with passwords or integrity checks, and use encryption when you must read the value back, such as a stored address.",
        "Do not invent your own algorithm or mode. Use a vetted library with authenticated encryption such as AES-GCM or ChaCha20-Poly1305, which detects tampering as well as hiding content.",
      ],
      callout: {
        kind: "insight",
        text: "Rule: need the original back, encrypt; only need to verify, hash; need to prove authorship, sign.",
      },
      metrics: [
        { label: "In transit", value: "TLS 1.3", level: "good" },
        { label: "At rest", value: "AES-GCM", level: "good" },
        { label: "Key exposure", value: "managed", level: "good" },
      ],
      scene: {
        show: ["web", "db", "kms"],
        hot: ["web"],
        badges: { web: "hash to compare", db: "encrypt to read back", kms: "sign to prove" },
      },
    },
    {
      short: "Recap",
      title: "Layers and where the key lives",
      body: [
        "TLS on every hop, encryption on every store, a key service guarding the master key, and secrets injected at runtime and rotated. Each layer covers a different attack.",
        "Before shipping, ask of every secret: where does it live, who can read it, how do I replace it, and what happens in the hour after it leaks.",
      ],
      callout: {
        kind: "tip",
        text: "If you cannot rotate a key in under a day without an outage, practise it now, before you need it.",
      },
      metrics: [
        { label: "In transit", value: "TLS everywhere", level: "good" },
        { label: "At rest", value: "envelope + KMS", level: "good" },
        { label: "Key exposure", value: "rotated, short-lived", level: "good" },
        { label: "Overhead", value: "~5 ms, < 5%", level: "good" },
      ],
      scene: {
        show: ["you", "web", "kms", "db", "bak"],
        badges: {
          web: "TLS in, TLS out",
          kms: "keys + secrets",
          db: "encrypted",
          bak: "encrypted",
        },
      },
    },
  ],
};
