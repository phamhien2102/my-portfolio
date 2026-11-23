import type { Lesson } from "../lib/types";

export const testing: Lesson = {
  id: "testing",
  title: "Testing",
  summary:
    "Build confidence cheaply: unit, integration and end-to-end tests, fakes, flakiness, and what runs in CI.",
  minutes: 12,
  level: "beginner",
  goals: [
    "Unit, integration and end-to-end tests compared",
    "The test pyramid and why its shape matters",
    "Test doubles for slow or unreliable dependencies",
    "Why tests turn flaky and how to fix them",
    "What belongs in continuous integration",
  ],
  takeaways: [
    "Write many fast unit tests, fewer integration tests and a handful of end-to-end tests.",
    "Replace slow or unreliable dependencies with fakes, and use contract tests to keep the fakes honest.",
    "A flaky test is worse than none: fix or delete it, because people stop trusting a suite that cries wolf.",
  ],
  hud: [
    { label: "Run time", icon: "timer" },
    { label: "Tests", icon: "layers" },
    { label: "Flaky", icon: "alert" },
    { label: "Confidence", icon: "shield" },
  ],
  nodes: [
    { id: "dev", kind: "user", label: "developer", x: 100, y: 150 },
    { id: "ci", kind: "server", label: "CI Runner", x: 310, y: 150 },
    { id: "app", kind: "service", label: "Service", sub: "code under test", x: 510, y: 40 },
    { id: "db", kind: "db", label: "Test DB", x: 510, y: 260 },
    { id: "ext", kind: "limiter", label: "Payments", sub: "third party", x: 740, y: 150 },
  ],
  links: [
    { id: "dc", from: "dev", to: "ci" },
    { id: "ca", from: "ci", to: "app" },
    { id: "ad", from: "app", to: "db" },
    { id: "ae", from: "app", to: "ext" },
    { id: "cd", from: "ci", to: "db" },
  ],
  steps: [
    {
      short: "Does it work?",
      title: "You changed one line. What broke?",
      body: [
        "In a growing system, a small edit can break a distant feature. Checking by hand does not scale: nobody re-clicks every flow before every release.",
        'Automated tests are a safety net. They turn "I think it still works" into a result you can read in minutes, and make refactoring something you dare to do.',
      ],
      callout: {
        kind: "insight",
        text: "Tests do not prove the absence of bugs. They catch the ones you thought of, forever, at nearly zero cost per run.",
      },
      metrics: [
        { label: "Run time", value: "manual: hours", level: "bad" },
        { label: "Confidence", value: "low", level: "bad" },
      ],
      scene: {
        show: ["dev", "ci", "app"],
        flows: [{ link: "dc", label: "git push" }],
        bubbles: { dev: "changed one line" },
      },
    },
    {
      short: "Unit",
      title: "Unit tests: one function, no I/O",
      body: [
        "A unit test calls a small piece of code with inputs and checks the output, for example `price(cart, coupon)`. No database, no network, no clock, so each test takes about a millisecond.",
        "You can run thousands in a few seconds, and a failure points at one function. Cover edge cases here: empty cart, zero, negative, very large, wrong type.",
      ],
      callout: {
        kind: "tip",
        text: "Arrange the inputs, act by calling the code, assert on the result. One idea per test, with a name that says what broke.",
      },
      metrics: [
        { label: "Run time", value: "2,000 in 4 s", level: "good" },
        { label: "Tests", value: "2,000", level: "good" },
        { label: "Confidence", value: "logic only", level: "warn" },
      ],
      scene: {
        show: ["ci", "app"],
        hot: ["app"],
        flows: [
          { link: "ca", label: "price(cart, coupon)" },
          { link: "ca", reverse: true, tone: "res", delay: 0.8, label: "pass" },
        ],
        badges: { app: "~1 ms per test" },
      },
    },
    {
      short: "Integration",
      title: "Integration tests: do the parts fit?",
      body: [
        "Perfect functions can still fail when wired together: a column renamed, a query wrong, a JSON field missing. Integration tests run real components, such as your service against a real database started in a container.",
        "They take 100 ms to a few seconds each, so you write fewer. Aim them at the boundaries: queries, migrations, serialisation and API handlers.",
      ],
      callout: {
        kind: "warn",
        text: "Reset state between tests, or use a fresh transaction per test. Tests that depend on leftovers from earlier ones break in random order.",
      },
      metrics: [
        { label: "Run time", value: "200 in 40 s", level: "warn" },
        { label: "Tests", value: "200", level: "good" },
        { label: "Confidence", value: "wiring checked", level: "good" },
      ],
      scene: {
        show: ["ci", "app", "db"],
        hot: ["db"],
        flows: [
          { link: "ca", label: "POST /orders" },
          { link: "ad", delay: 0.8, label: "INSERT, then SELECT" },
        ],
        badges: { db: "fresh container per run" },
      },
    },
    {
      short: "End to end",
      title: "End-to-end tests: the whole journey",
      body: [
        'An end-to-end test drives the real system as a user would, through a browser, across services and into the database. It gives the most realistic confidence, such as "a customer can check out".',
        "It is also slow, 10 to 60 seconds each, and fragile, since any layer can fail it. Keep to a few critical journeys: sign up, pay, the core feature.",
      ],
      metrics: [
        { label: "Run time", value: "20 in 8 min", level: "bad" },
        { label: "Tests", value: "20", level: "good" },
        { label: "Confidence", value: "high, slow", level: "warn" },
      ],
      scene: {
        show: ["dev", "ci", "app", "db", "ext"],
        hot: ["ci"],
        flows: [
          { link: "ca", label: "click through checkout" },
          { link: "ad", delay: 0.6 },
          { link: "ae", delay: 1.2, label: "charge test card" },
        ],
        badges: { ci: "drives a real browser" },
      },
    },
    {
      short: "Pyramid",
      title: "The test pyramid",
      body: [
        "Lots of unit tests at the base, fewer integration tests in the middle, a handful of end-to-end tests at the top. Cost and speed get worse as you climb, so spend your budget low.",
        'Inverting it, an "ice-cream cone" with mostly end-to-end tests, gives a suite that takes an hour, fails for unclear reasons, and that people stop running.',
      ],
      callout: {
        kind: "insight",
        text: "Test each thing at the lowest level that can catch the bug. Pricing maths is a unit test; the checkout button is an end-to-end test.",
      },
      metrics: [
        { label: "Run time", value: "~9 min total", level: "warn" },
        { label: "Tests", value: "2,000 / 200 / 20", level: "good" },
        { label: "Confidence", value: "broad and quick", level: "good" },
      ],
      scene: {
        show: ["ci", "app", "db", "ext"],
        badges: { app: "2,000 unit, 4 s", db: "200 integration, 40 s", ext: "20 e2e, 8 min" },
      },
    },
    {
      short: "Fakes",
      title: "Test doubles for what you cannot control",
      body: [
        "A real payment provider is slow, costs money and may be down. Swap it for a double: a stub that returns a canned reply, a fake with simple in-memory behaviour, or a mock that records calls so you can assert on them.",
        "This makes tests fast and deterministic, and lets you simulate failures that are hard to trigger for real: a timeout, a 500, a declined card.",
      ],
      callout: {
        kind: "warn",
        text: "Do not mock everything. A test that only checks that your mocks were called proves nothing about real behaviour.",
      },
      metrics: [
        { label: "Run time", value: "3 s, was 40 s", level: "good" },
        { label: "Flaky", value: "0", level: "good" },
        { label: "Confidence", value: "needs contract test", level: "warn" },
      ],
      scene: {
        show: ["ci", "app", "ext"],
        hot: ["ext"],
        flows: [
          { link: "ae", label: "charge 20 USD" },
          { link: "ae", reverse: true, tone: "warn", delay: 0.8, label: "stub: 503 timeout" },
        ],
        badges: { ext: "fake, no network" },
      },
    },
    {
      short: "Flaky",
      title: "Case: the test that fails one run in twenty",
      chapter: { label: "Case", tone: "amber" },
      body: [
        "Passing locally, failing in CI, then passing on retry. Common causes are real sleeps and timing races, shared data between tests, dependence on the current time, test order, and live network calls.",
        "With 500 tests each flaky just 0.5 percent of the time, about nine in ten builds go red for no reason. People then ignore red, and a real failure slips through.",
      ],
      callout: {
        kind: "warn",
        text: "Quarantine a flaky test the day you find it, then fix it. Never leave it red and never just add automatic retries.",
      },
      metrics: [
        { label: "Run time", value: "9 min + reruns", level: "bad" },
        { label: "Flaky", value: "5% of builds", level: "bad" },
        { label: "Confidence", value: "eroding", level: "bad" },
      ],
      scene: {
        show: ["ci", "app", "db"],
        hot: ["ci"],
        flows: [
          { link: "ca", tone: "warn", label: "sleep(2) then check" },
          { link: "ad", tone: "warn", delay: 0.8, label: "shared rows" },
        ],
        badges: { ci: "red, then green on retry" },
      },
    },
    {
      short: "Contracts",
      title: "Contract tests keep fakes honest",
      body: [
        'If your fake says the provider returns `{status: "ok"}` and the real one changes to `{state: "ok"}`, your tests stay green while production breaks. A contract test checks the shape of messages against the real thing, or against a shared spec.',
        "Run them on a schedule or whenever either side changes. They are the cheap middle road between mocking everything and running every service in every test.",
      ],
      metrics: [
        { label: "Tests", value: "+30 contract", level: "good" },
        { label: "Run time", value: "+5 s", level: "good" },
        { label: "Confidence", value: "fakes verified", level: "good" },
      ],
      scene: {
        show: ["ci", "app", "ext"],
        hot: ["ext"],
        flows: [
          { link: "ae", label: "does the shape match?" },
          { link: "ae", reverse: true, tone: "res", delay: 0.8, label: "yes: status ok" },
        ],
        badges: { ext: "sandbox, nightly check" },
      },
    },
    {
      short: "CI",
      title: "Run it on every push",
      body: [
        "Tests only help if they run. Continuous integration runs the suite on every pull request and blocks the merge on red. Fast tests first, so a typo fails in 30 seconds, not 10 minutes.",
        "Keep the main path under about 10 minutes by running tests in parallel. Past that, people batch changes and the feedback loop slows down, which is when bugs get expensive.",
      ],
      callout: {
        kind: "tip",
        text: "Also watch production: canary releases, health checks and error alerts catch what no test environment can.",
      },
      metrics: [
        { label: "Run time", value: "~6 min parallel", level: "good" },
        { label: "Flaky", value: "< 0.1%", level: "good" },
        { label: "Confidence", value: "gate on every PR", level: "good" },
      ],
      scene: {
        show: ["dev", "ci", "app", "db"],
        hot: ["ci"],
        flows: [
          { link: "dc", label: "pull request" },
          { link: "dc", reverse: true, tone: "res", delay: 0.8, label: "green: safe to merge" },
        ],
        badges: { ci: "unit, then integration, e2e" },
      },
    },
    {
      short: "Recap",
      title: "Spend tests where they pay",
      body: [
        "Roughly: thousands of unit tests in seconds, hundreds of integration tests in under a minute, a few dozen end-to-end journeys in minutes. Use doubles for slow outsiders and contracts to verify them.",
        "Decision rule: if a bug could be caught lower in the pyramid, test it there. If a test is flaky, fix it today. If the suite is slow, people will stop trusting it.",
      ],
      metrics: [
        { label: "Run time", value: "< 10 min", level: "good" },
        { label: "Tests", value: "2,000 / 200 / 20", level: "good" },
        { label: "Flaky", value: "none tolerated", level: "good" },
        { label: "Confidence", value: "high", level: "good" },
      ],
      scene: {
        show: ["dev", "ci", "app", "db", "ext"],
        badges: {
          ci: "gate every merge",
          app: "many, fast",
          db: "some, real",
          ext: "few, doubled",
        },
      },
    },
  ],
};
