import type { Lesson } from "../lib/types";

export const authentication: Lesson = {
  id: "authentication",
  title: "Authentication",
  summary:
    "Prove who is calling: password hashing, sessions, tokens, and what happens when credentials leak.",
  minutes: 13,
  level: "intermediate",
  goals: [
    "How passwords are stored and checked safely",
    "Sessions versus signed tokens, and what each costs",
    "Why short-lived access tokens need refresh tokens",
    "How attackers get in, and the defences that slow them",
  ],
  takeaways: [
    "Never store passwords: store slow, salted hashes and compare those.",
    "Sessions are easy to revoke but need a lookup; signed tokens skip the lookup but are hard to revoke.",
    "Layer defences: rate limits, a second factor and short token lifetimes, because any single one can fail.",
  ],
  hud: [
    { label: "Login cost", icon: "timer" },
    { label: "Lookups / request", icon: "database" },
    { label: "Revocable", icon: "shield" },
    { label: "Attack risk", icon: "alert" },
  ],
  nodes: [
    { id: "you", kind: "user", label: "client", x: 100, y: 150 },
    { id: "api", kind: "server", label: "API", x: 310, y: 150 },
    { id: "auth", kind: "service", label: "Auth", sub: "login", x: 490, y: 40 },
    { id: "db", kind: "db", label: "User DB", x: 490, y: 260 },
    { id: "sess", kind: "cache", label: "Sessions", x: 710, y: 150 },
  ],
  links: [
    { id: "ca", from: "you", to: "api" },
    { id: "aa", from: "api", to: "auth" },
    { id: "ad", from: "auth", to: "db" },
    { id: "as", from: "api", to: "sess" },
    { id: "us", from: "auth", to: "sess" },
  ],
  steps: [
    {
      short: "Who is this?",
      title: "HTTP has no memory of who you are",
      body: [
        "Every request arrives on its own. The server cannot see a person, only bytes, and anyone can send bytes that claim to be Alice.",
        "Authentication is the job of turning that claim into proof, once at login and again on every request that follows.",
      ],
      callout: {
        kind: "insight",
        text: 'Authentication answers "who are you?". Authorization, a later lesson, answers "what may you do?". Keep the two apart in your head and in your code.',
      },
      metrics: [{ label: "Attack risk", value: "open", level: "bad" }],
      scene: {
        show: ["you", "api"],
        bubbles: { you: "I am alice" },
        flows: [{ link: "ca", label: "GET /account" }],
      },
    },
    {
      short: "Store hashes",
      title: "Store a hash, never the password",
      body: [
        "The database keeps `hash(salt + password)`, not the password. A salt is a random value per user, so two people with the same password get different hashes and precomputed tables are useless.",
        "Use a deliberately slow function such as bcrypt, scrypt or Argon2. Tuned to roughly 100 ms per check, it is invisible to one user and brutal for an attacker trying billions of guesses.",
      ],
      callout: {
        kind: "warn",
        text: "A plain fast hash like SHA-256 can be tried billions of times per second on a GPU. Slowness is the feature here.",
      },
      metrics: [
        { label: "Login cost", value: "~100 ms", level: "good" },
        { label: "Attack risk", value: "offline guessing", level: "warn" },
      ],
      scene: {
        show: ["you", "api", "auth", "db"],
        hot: ["db"],
        flows: [
          { link: "aa", label: "alice + password" },
          { link: "ad", delay: 0.8, label: "load salt + hash" },
        ],
        badges: { db: "salt + argon2 hash" },
      },
    },
    {
      short: "Sessions",
      title: "Login once, then carry a session id",
      body: [
        "After the hash matches, the server creates a random session id, stores `id -> user 17` in a fast store, and returns it in a cookie marked `HttpOnly`, `Secure` and `SameSite`.",
        "Each later request carries the cookie. The server looks the id up, finds the user, and carries on. No password travels again.",
      ],
      callout: {
        kind: "tip",
        text: "Make session ids long and random (128 bits or more). A guessable id is the same as a guessable password.",
      },
      metrics: [
        { label: "Login cost", value: "~100 ms", level: "good" },
        { label: "Lookups / request", value: "1", level: "warn" },
        { label: "Revocable", value: "yes, instantly", level: "good" },
      ],
      scene: {
        show: ["you", "api", "auth", "sess"],
        hot: ["sess"],
        flows: [
          { link: "us", label: "save id -> user 17" },
          { link: "ca", reverse: true, tone: "res", delay: 0.8, label: "Set-Cookie: sid" },
        ],
        badges: { sess: "sid -> user 17" },
      },
    },
    {
      short: "Session cost",
      title: "The price of sessions: a lookup per request",
      body: [
        "Every request now reads the session store. In memory that is about a millisecond, but it is one more dependency that must be fast and available. If it dies, everyone is logged out.",
        'The upside is control. Delete one entry and that user is out on the next request, which makes "log out everywhere" and banning an account trivial.',
      ],
      metrics: [
        { label: "Lookups / request", value: "1", level: "warn" },
        { label: "Revocable", value: "yes, instantly", level: "good" },
      ],
      scene: {
        show: ["you", "api", "sess"],
        hot: ["sess"],
        flows: [
          { link: "ca", label: "cookie: sid" },
          { link: "as", delay: 0.8, label: "who is sid?" },
          { link: "as", reverse: true, tone: "res", delay: 1.6, label: "user 17" },
        ],
        badges: { sess: "~1 ms, shared state" },
      },
    },
    {
      short: "Signed token",
      title: "Signed tokens remove the lookup",
      body: [
        "A JWT-style token carries the claims itself: `{sub: 17, exp: 1700000900}`, followed by a signature made with a secret key. Any server that holds the key can verify it without asking anyone.",
        "That fits many stateless servers well: no shared session store, no lookup, verification in microseconds.",
      ],
      callout: {
        kind: "warn",
        text: "A token is signed, not encrypted. Anyone can read the claims, so never put secrets in it, and always check the signature and `exp`.",
      },
      metrics: [
        { label: "Lookups / request", value: "0", level: "good" },
        { label: "Revocable", value: "not until expiry", level: "bad" },
      ],
      scene: {
        show: ["you", "api"],
        hot: ["api"],
        flows: [{ link: "ca", label: "Bearer eyJhbGci..." }],
        badges: { api: "verify signature locally" },
        bubbles: { you: "sub 17, exp +15 min" },
      },
    },
    {
      short: "Refresh",
      title: "Short access tokens, long refresh tokens",
      body: [
        "Because a signed token cannot be recalled, make it live briefly, say 15 minutes. The client also holds a refresh token that lasts weeks and is stored server-side, so it can be revoked.",
        "When the access token expires the client trades the refresh token for a new one. The auth service checks it still exists, so a banned user is cut off within 15 minutes.",
      ],
      callout: {
        kind: "tip",
        text: "Rotate refresh tokens on every use. If an old one shows up twice, someone copied it, so revoke the whole family.",
      },
      metrics: [
        { label: "Lookups / request", value: "0", level: "good" },
        { label: "Revocable", value: "within 15 min", level: "warn" },
      ],
      scene: {
        show: ["you", "api", "auth", "sess"],
        hot: ["auth"],
        flows: [
          { link: "ca", label: "expired? send refresh" },
          { link: "aa", delay: 0.8, label: "refresh token" },
          { link: "us", delay: 1.6, label: "still valid?" },
        ],
        badges: { auth: "mints a new token" },
      },
    },
    {
      short: "Brute force",
      title: "Case: credential stuffing at 5,000 tries a minute",
      chapter: { label: "Case", tone: "amber" },
      body: [
        "Attackers take leaked email and password pairs from other sites and try them against yours. Many people reuse passwords, so even a 1 percent hit rate is thousands of stolen accounts.",
        "Per-account and per-IP rate limits, lockouts with backoff, breached-password checks and bot detection each cut the success rate. None is enough alone.",
      ],
      callout: {
        kind: "warn",
        text: 'Return the same message for "unknown user" and "wrong password", and take the same time. Otherwise login becomes a tool for finding valid accounts.',
      },
      metrics: [
        { label: "Login cost", value: "~100 ms", level: "good" },
        { label: "Attack risk", value: "5,000 tries/min", level: "bad" },
      ],
      scene: {
        show: ["you", "api", "auth"],
        hot: ["api"],
        flows: [
          { link: "ca", tone: "warn", label: "5,000 logins / min" },
          { link: "ca", tone: "warn", delay: 0.4 },
          { link: "aa", delay: 0.8, label: "429 after 5 failures" },
        ],
        badges: { api: "rate limit per account" },
      },
    },
    {
      short: "2nd factor",
      title: "Add a second factor and delegate when you can",
      body: [
        "A second factor, such as an authenticator app code or a hardware key, means a stolen password alone is not enough. Hardware keys also resist phishing, because they only answer to the real domain.",
        "Better still, avoid owning passwords. Let an identity provider handle login through OAuth or OpenID Connect, and your service receives a verified identity instead of a secret to guard.",
      ],
      metrics: [
        { label: "Login cost", value: "+5 s user time", level: "warn" },
        { label: "Attack risk", value: "stolen password fails", level: "good" },
      ],
      scene: {
        show: ["you", "api", "auth"],
        hot: ["auth"],
        flows: [
          { link: "aa", label: "password ok" },
          { link: "aa", reverse: true, tone: "hand", delay: 0.8, label: "now enter your code" },
        ],
        badges: { auth: "password + one-time code" },
      },
    },
    {
      short: "Recap",
      title: "Choosing and hardening",
      body: [
        "Hash with a slow salted function. Use sessions when you need instant revocation and have a shared store; use short signed tokens when many stateless servers must verify without a lookup, and pair them with refresh tokens.",
        "Rule of thumb: assume each layer will eventually fail, so combine slow hashes, rate limits, a second factor and short lifetimes.",
      ],
      callout: {
        kind: "tip",
        text: "Default to sessions for a first-party web app. Reach for tokens when a mobile app or separate services need to verify on their own.",
      },
      metrics: [
        { label: "Login cost", value: "~100 ms", level: "good" },
        { label: "Lookups / request", value: "0 or 1", level: "good" },
        { label: "Revocable", value: "instant or 15 min", level: "warn" },
        { label: "Attack risk", value: "layered", level: "good" },
      ],
      scene: {
        show: ["you", "api", "auth", "db", "sess"],
        badges: { db: "hashes only", sess: "or signed tokens", auth: "rate limit + 2FA" },
      },
    },
  ],
};
