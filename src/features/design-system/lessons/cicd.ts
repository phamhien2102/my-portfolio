import type { Lesson } from "../lib/types";

export const cicd: Lesson = {
  id: "cicd",
  title: "CI/CD & Deployments",
  summary:
    "Turn a commit into running software with automated checks, safe rollouts and a fast way back.",
  minutes: 13,
  level: "intermediate",
  goals: [
    "How continuous integration catches breakage within minutes",
    "Why build once and promote the same artifact",
    "Rolling, blue-green and canary rollouts and their trade-offs",
    "How a bad release is rolled back quickly",
    "Feature flags and safe database migrations",
  ],
  takeaways: [
    "Build the artifact once, test it automatically, and promote that exact artifact through every environment.",
    "Small, frequent releases behind canaries and flags are safer than rare big ones, because each change is easy to blame and to undo.",
    "Plan the way back before the way forward: keep the old version running, make migrations backward compatible, and watch error rates.",
  ],
  hud: [
    { label: "Lead time", icon: "timer" },
    { label: "Pipeline", icon: "gauge" },
    { label: "Traffic on new", icon: "users" },
    { label: "Error rate", icon: "alert" },
    { label: "Deploys / week", icon: "layers" },
  ],
  nodes: [
    { id: "dev", kind: "user", label: "Dev", x: 100, y: 150 },
    { id: "repo", kind: "server", label: "Git Repo", x: 300, y: 150 },
    { id: "ci", kind: "service", label: "CI Runner", x: 430, y: 150 },
    { id: "art", kind: "db", label: "Artifacts", x: 430, y: 40 },
    { id: "stage", kind: "server", label: "Staging", x: 560, y: 40 },
    { id: "lb", kind: "lb", label: "Prod LB", x: 430, y: 260 },
    { id: "v1", kind: "server", label: "Prod v1", x: 560, y: 260 },
    { id: "v2", kind: "server", label: "Prod v2", x: 560, y: 150 },
  ],
  links: [
    { id: "d-r", from: "dev", to: "repo" },
    { id: "r-c", from: "repo", to: "ci" },
    { id: "c-a", from: "ci", to: "art" },
    { id: "a-s", from: "art", to: "stage" },
    { id: "c-l", from: "ci", to: "lb" },
    { id: "l-1", from: "lb", to: "v1" },
    { id: "l-2", from: "lb", to: "v2" },
  ],
  steps: [
    {
      short: "Manual ship",
      title: "Releases that hurt",
      body: [
        "Picture a team that ships once a month. Someone builds on their laptop, copies files to a server over SSH and hopes the staging tests they ran last week still apply.",
        "A month of changes lands at once, so when something breaks nobody knows which of the 200 commits did it. People start to fear releases, and that fear makes them rarer and bigger.",
      ],
      callout: {
        kind: "insight",
        text: "Release pain grows faster than release size. Shipping small and often is not a luxury; it is how you keep each release boring.",
      },
      metrics: [
        { label: "Lead time", value: "30 days", level: "bad" },
        { label: "Deploys / week", value: "0.25", level: "bad" },
        { label: "Error rate", value: "unknown", level: "warn" },
      ],
      scene: {
        show: ["dev", "repo"],
        hot: ["dev"],
        flows: [{ link: "d-r", tone: "warn", label: "200 commits at once" }],
        badges: { repo: "release on the 1st" },
      },
    },
    {
      short: "Commit",
      title: "Every commit triggers a build (CI)",
      body: [
        "Continuous integration means merging to a shared branch many times a day, and letting a machine verify each change. A push to `main` wakes up a CI runner.",
        "The runner checks out the exact commit in a clean environment, installs dependencies, compiles and runs the unit tests. Clean matters: it removes the classic excuse that it works on my machine.",
      ],
      callout: {
        kind: "tip",
        text: "Keep the commit-to-green loop under about 10 minutes. Past that, people stop waiting for it and batch their changes again.",
      },
      metrics: [
        { label: "Lead time", value: "8 min", level: "good" },
        { label: "Pipeline", value: "build + unit", level: "good" },
        { label: "Deploys / week", value: "1", level: "warn" },
      ],
      scene: {
        show: ["dev", "repo", "ci"],
        hot: ["ci"],
        flows: [
          { link: "d-r", label: "git push" },
          { link: "r-c", delay: 0.8, label: "webhook: build abc123" },
        ],
        badges: { ci: "clean container" },
      },
    },
    {
      short: "Artifact",
      title: "Build once, keep the artifact",
      body: [
        "If the build passes, CI packages the result once: a container image tagged with the commit hash, such as `shop:abc123`, pushed to an artifact registry.",
        "Every later stage deploys that same image. Rebuilding per environment would mean the thing you tested is not the thing you shipped.",
      ],
      callout: {
        kind: "warn",
        text: "Never tag production images with a moving name like `latest`. A hash or version number tells you exactly what is running and what to roll back to.",
      },
      metrics: [
        { label: "Lead time", value: "12 min", level: "good" },
        { label: "Pipeline", value: "image pushed", level: "good" },
        { label: "Deploys / week", value: "1", level: "warn" },
      ],
      scene: {
        show: ["dev", "repo", "ci", "art"],
        hot: ["art"],
        flows: [{ link: "c-a", label: "push shop:abc123" }],
        badges: { art: "immutable tags", ci: "tests passed" },
      },
    },
    {
      short: "Staging",
      title: "Promote through staging and gates",
      body: [
        "The pipeline now deploys the image to staging, an environment shaped like production, and runs slower checks there: integration tests, a smoke test against a real database, maybe a security scan.",
        "Each stage is a gate. Cheap checks run first so a typo fails in a minute rather than after a 20-minute suite. For a sensitive service you can add a manual approval before production.",
      ],
      callout: {
        kind: "insight",
        text: "Order gates by cost and signal: lint and unit tests (seconds), integration (minutes), end-to-end (longest, fewest). Fail fast, run the expensive ones in parallel.",
      },
      metrics: [
        { label: "Lead time", value: "25 min", level: "good" },
        { label: "Pipeline", value: "integration pass", level: "good" },
        { label: "Deploys / week", value: "5", level: "good" },
      ],
      scene: {
        show: ["ci", "art", "stage"],
        hot: ["stage"],
        flows: [
          { link: "a-s", label: "deploy abc123" },
          { link: "a-s", reverse: true, tone: "res", delay: 0.9, label: "smoke tests green" },
        ],
        badges: { stage: "prod-like data shape" },
      },
    },
    {
      short: "Strategies",
      title: "Three ways to roll out",
      body: [
        "Rolling replaces instances a few at a time: cheap, but old and new versions serve traffic together for a while. Blue-green keeps a full second copy and flips the load balancer at once: instant switch and instant rollback, at the price of double capacity.",
        "Canary sends a small slice of real traffic to the new version first and widens it only if the numbers stay healthy. It costs a little extra capacity and gives the best protection.",
      ],
      callout: {
        kind: "tip",
        text: "Choose by blast radius. A risky change to a payment path deserves a canary; a typo fix on an internal tool can simply roll.",
      },
      metrics: [
        { label: "Lead time", value: "30 min", level: "good" },
        { label: "Traffic on new", value: "0%", level: "good" },
        { label: "Error rate", value: "0.1%", level: "good" },
      ],
      scene: {
        show: ["ci", "lb", "v1", "v2"],
        hot: ["lb"],
        flows: [{ link: "c-l", label: "release abc123" }],
        badges: { v1: "old version", v2: "new version", lb: "rolling / blue-green / canary" },
      },
    },
    {
      short: "Canary",
      title: "A canary takes 5% of traffic",
      body: [
        "The load balancer sends 5% of requests to v2 and 95% to v1. If you serve 2,000 requests per second, v2 sees about 100, enough to reveal a crash or a latency jump within minutes.",
        "The pipeline compares v2 against v1 on error rate and p99 latency. If v2 stays within bounds it steps up to 25%, 50%, then 100%, and the old instances are drained.",
      ],
      callout: {
        kind: "insight",
        text: "Automate the comparison. A human watching a dashboard at 3 a.m. is slower and less consistent than a rule such as: abort if v2 errors exceed v1 by 0.5 points.",
      },
      metrics: [
        { label: "Traffic on new", value: "5%", level: "good" },
        { label: "Error rate", value: "0.1%", level: "good" },
        { label: "Lead time", value: "45 min", level: "good" },
      ],
      scene: {
        show: ["lb", "v1", "v2"],
        hot: ["v2"],
        flows: [
          { link: "l-1", label: "95%" },
          { link: "l-2", delay: 0.4, label: "5%" },
        ],
        badges: { v2: "p99 180 ms", v1: "p99 175 ms" },
      },
    },
    {
      short: "Rollback",
      title: "Case: the canary starts failing",
      chapter: { label: "Case", tone: "amber" },
      body: [
        "Four minutes in, v2 shows 6% errors against 0.1% on v1. A null pointer in a code path that staging never exercised. The automated check trips.",
        "The load balancer shifts the 5% back to v1, which never stopped running. About 300 requests failed instead of millions; rollback was a routing change, not a rebuild.",
      ],
      callout: {
        kind: "warn",
        text: "Rollback only works if the old version is still around and compatible with the data. Keep the previous version running until the new one has proven itself.",
      },
      metrics: [
        { label: "Traffic on new", value: "0%", level: "good" },
        { label: "Error rate", value: "6% then 0.1%", level: "warn" },
        { label: "Lead time", value: "rolled back in 1 min", level: "good" },
      ],
      scene: {
        show: ["lb", "v1", "v2"],
        down: ["v2"],
        hot: ["lb"],
        flows: [
          { link: "l-1", tone: "res", label: "100% to v1" },
          { link: "l-2", tone: "warn", delay: 0.4, label: "500 errors" },
        ],
        badges: { v2: "6% errors, drained" },
      },
    },
    {
      short: "Flags + DB",
      title: "Flags and safe migrations",
      body: [
        "Deploying code and releasing a feature are different things. Ship the new code dark behind a feature flag, then switch it on for 1% of users, staff first, without another deploy. Turning it off is instant.",
        "Databases need the same care. Use expand then contract: first add the new column (old code ignores it), deploy code that writes both, backfill, switch reads, and only later drop the old column. Both versions of the app stay valid throughout.",
      ],
      callout: {
        kind: "tip",
        text: "A migration that renames a column in place breaks the old version the moment it runs, which kills your rollback. Prefer additive changes.",
      },
      metrics: [
        { label: "Traffic on new", value: "100% code, 1% feature", level: "good" },
        { label: "Error rate", value: "0.1%", level: "good" },
        { label: "Deploys / week", value: "20", level: "good" },
      ],
      scene: {
        show: ["lb", "v1", "v2"],
        hot: ["v2"],
        flows: [
          { link: "l-2", label: "flag new_checkout = 1%" },
          { link: "l-1", delay: 0.5 },
        ],
        badges: { v2: "new code, flag off by default" },
      },
    },
    {
      short: "Recap",
      title: "A safe path from commit to users",
      body: [
        "Commit, build once, test in layers, promote the same artifact, release gradually, watch the numbers, and be able to undo in a minute. Each stage trades a little time for a lot of safety.",
        "Teams that do this deploy many times a day with lead times around an hour and recover from bad releases in minutes. The speed comes from the safety, not despite it.",
      ],
      callout: {
        kind: "insight",
        text: "Rule of thumb: if a release scares you, release smaller, more often, and behind a flag, rather than adding more manual sign-offs.",
      },
      metrics: [
        { label: "Lead time", value: "~1 hour", level: "good" },
        { label: "Pipeline", value: "build, test, canary", level: "good" },
        { label: "Traffic on new", value: "5% -> 100%", level: "good" },
        { label: "Error rate", value: "auto-checked", level: "good" },
        { label: "Deploys / week", value: "20+", level: "good" },
      ],
      scene: {
        show: ["dev", "repo", "ci", "art", "stage"],
        badges: { dev: "commit", ci: "build + test", art: "one artifact", stage: "gates" },
      },
    },
  ],
};
