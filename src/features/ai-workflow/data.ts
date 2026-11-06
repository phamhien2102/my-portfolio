/**
 * An eight-phase plan for building one Claude Code workflow, ticket to pull request, a layer at
 * a time: context, commands, guardrails, helpers, outside tools, then unattended runs.
 *
 * Every link was checked with curl. The docs move, so if one 404s, search the title on
 * code.claude.com/docs rather than deleting the step.
 */

export interface Step {
  /** Stable id: the checkbox state is stored under it, so never reuse one. */
  id: string;
  title: string;
  detail: string;
  href: string;
  source: string;
}

export interface Phase {
  id: string;
  number: string;
  title: string;
  weeks: string;
  goal: string;
  accent: string;
  bonus?: boolean;
  steps: readonly Step[];
  build: {
    id: string;
    name: string;
    blurb: string;
    proves: readonly string[];
    /** A starting point to paste into the repo and edit. */
    example?: { file: string; code: string };
  };
}

/** One whole page: a plan is a set of phases plus the words around them. */
export interface Plan {
  kicker: string;
  title: string;
  intro: string;
  phases: readonly Phase[];
  rules: readonly string[];
  rulesTitle: string;
  /** Which tools to choose between, when the plan starts with that choice. */
  compare?: { title: string; intro: string; rows: readonly ToolRow[] };
  /** Links to the sibling plans, shown above the title. */
  others: readonly { href: string; label: string }[];
}

export interface ToolRow {
  tool: string;
  fits: string;
  tradeoff: string;
  hosting: string;
}

/** Every checkbox id in a plan: the steps plus the version each phase builds. */
export function idsOf(phases: readonly Phase[]): string[] {
  return phases.flatMap((phase) => [...phase.steps.map((step) => step.id), phase.build.id]);
}

const DOCS = "Claude Code docs";
const SDK = "Agent SDK docs";

export const PHASES: readonly Phase[] = [
  {
    id: "loop",
    number: "01",
    title: "Learn the loop",
    weeks: "1 week",
    goal: "Know what Claude Code does between your prompt and the diff, so every later automation has something to hook into.",
    accent: "#0369a1",
    steps: [
      {
        id: "loop-how",
        title: "How Claude Code works",
        detail: "The agentic loop: gather context, act, verify. Tools, context window, sessions.",
        href: "https://code.claude.com/docs/en/how-claude-code-works",
        source: DOCS,
      },
      {
        id: "loop-practices",
        title: "Best practices",
        detail:
          "Give it a way to verify its work, explore then plan then code, manage context early.",
        href: "https://code.claude.com/docs/en/best-practices",
        source: DOCS,
      },
      {
        id: "loop-common",
        title: "Common workflows",
        detail: "Plan mode, resuming sessions, working in parallel, the everyday recipes.",
        href: "https://code.claude.com/docs/en/common-workflows",
        source: DOCS,
      },
      {
        id: "loop-checkpoints",
        title: "Checkpointing",
        detail:
          "Rewind code and conversation when a run goes sideways, before you automate anything.",
        href: "https://code.claude.com/docs/en/checkpointing",
        source: DOCS,
      },
    ],
    build: {
      id: "build-loop",
      name: "Workflow v0.1 — one task by hand",
      blurb:
        "Pick a small real ticket in this repo. Do it in plan mode, read the plan, approve, run the checks yourself, and write down every point where you had to step in.",
      proves: ["Plan mode", "Verify before done", "A list of what to automate next"],
    },
  },
  {
    id: "memory",
    number: "02",
    title: "Context and permissions",
    weeks: "1 week",
    goal: "Stop re-explaining the repo. Put the rules where Claude reads them, and decide what it may do without asking.",
    accent: "#4d7c0f",
    steps: [
      {
        id: "memory-claude-md",
        title: "CLAUDE.md and memory",
        detail: "Project, user and nested files, imports, and what is worth writing down at all.",
        href: "https://code.claude.com/docs/en/memory",
        source: DOCS,
      },
      {
        id: "memory-settings",
        title: "Settings files",
        detail: "User, project and local scopes, and which one wins when they disagree.",
        href: "https://code.claude.com/docs/en/settings",
        source: DOCS,
      },
      {
        id: "memory-permissions",
        title: "Permissions",
        detail: "Allow, ask and deny rules for tools and paths; the modes you switch between.",
        href: "https://code.claude.com/docs/en/permissions",
        source: DOCS,
      },
      {
        id: "memory-security",
        title: "Security",
        detail:
          "What the sandbox protects, prompt injection, and why secrets stay out of the repo.",
        href: "https://code.claude.com/docs/en/security",
        source: DOCS,
      },
    ],
    build: {
      id: "build-memory",
      name: "Workflow v0.2 — a repo it already understands",
      blurb:
        "A short CLAUDE.md with the commands, the architecture rules and the traps, plus an allowlist so the checks run without a prompt and .env can never be read.",
      proves: ["Context that survives a new session", "Fewer permission prompts", "Secrets denied"],
    },
  },
  {
    id: "commands",
    number: "03",
    title: "Commands and skills",
    weeks: "1 week",
    goal: "Turn the steps you keep typing into one word, and let Claude pick up a procedure when the task calls for it.",
    accent: "#b45309",
    steps: [
      {
        id: "commands-skills",
        title: "Skills",
        detail: "A folder with a SKILL.md: when it applies, what to do, and any scripts it needs.",
        href: "https://code.claude.com/docs/en/skills",
        source: DOCS,
      },
      {
        id: "commands-slash",
        title: "Slash commands",
        detail: "Built-ins, your own commands, and arguments passed in.",
        href: "https://code.claude.com/docs/en/slash-commands",
        source: DOCS,
      },
      {
        id: "commands-cli",
        title: "CLI reference",
        detail: "The flags worth knowing: model, permission mode, resume, add-dir.",
        href: "https://code.claude.com/docs/en/cli-reference",
        source: DOCS,
      },
      {
        id: "commands-modes",
        title: "Interactive mode",
        detail:
          "Shortcuts, multiline input, background tasks: the speed you will not get back otherwise.",
        href: "https://code.claude.com/docs/en/interactive-mode",
        source: DOCS,
      },
    ],
    build: {
      id: "build-commands",
      name: "Workflow v0.3 — a skill for “is this done?”",
      blurb:
        "One skill that runs the checks, loads the changed route and reports what is left. Use it on every task for a week and fix the wording each time it misfires.",
      proves: [
        "A repeatable procedure",
        "A description that triggers at the right time",
        "Less typing",
      ],
      example: {
        file: ".claude/skills/ship-check/SKILL.md",
        code: `---
name: ship-check
description: Verify work before calling it done. Use after any code change in this repo.
---

1. Run \`npm run check\` and fix what you introduced. Ignore the two known exhaustive-deps warnings.
2. Run \`npm run build\` if routing, layouts or next.config changed.
3. Prettier only the files you touched: \`npx prettier --write <paths>\`.
4. Report: what changed, what you ran, what you did not verify.`,
      },
    },
  },
  {
    id: "hooks",
    number: "04",
    title: "Hooks",
    weeks: "1 week",
    goal: "CLAUDE.md asks nicely; a hook makes it happen. Move everything that must be true every time out of the prompt.",
    accent: "#be185d",
    steps: [
      {
        id: "hooks-guide",
        title: "Hooks guide",
        detail: "Events, matchers, and the first formatter hook, start to finish.",
        href: "https://code.claude.com/docs/en/hooks-guide",
        source: DOCS,
      },
      {
        id: "hooks-reference",
        title: "Hooks reference",
        detail:
          "Input on stdin, exit codes, and how a hook blocks a tool call or feeds back to Claude.",
        href: "https://code.claude.com/docs/en/hooks",
        source: DOCS,
      },
      {
        id: "hooks-troubleshooting",
        title: "Troubleshooting",
        detail: "Why a hook did not fire, and how to see what it received.",
        href: "https://code.claude.com/docs/en/troubleshooting",
        source: DOCS,
      },
    ],
    build: {
      id: "build-hooks",
      name: "Workflow v0.4 — guardrails that cannot be forgotten",
      blurb:
        "Format every edited file after it is written, and block writes to .env and lockfiles. Test each by asking Claude to break the rule.",
      proves: ["Deterministic behaviour", "A blocking hook", "Knowing hook vs. CLAUDE.md"],
      example: {
        file: ".claude/settings.json",
        code: `{
  "hooks": {
    "PostToolUse": [
      {
        "matcher": "Edit|Write",
        "hooks": [
          {
            "type": "command",
            "command": "jq -r '.tool_input.file_path' | xargs npx prettier --write"
          }
        ]
      }
    ]
  }
}
// A PreToolUse hook that prints a reason to stderr and exits 2 blocks the call.`,
      },
    },
  },
  {
    id: "agents",
    number: "05",
    title: "Subagents",
    weeks: "1 week",
    goal: "Give each job its own context and its own tools, so a long review does not eat the room the implementation needs.",
    accent: "#6d28d9",
    steps: [
      {
        id: "agents-subagents",
        title: "Subagents",
        detail: "Definition files, tool restrictions, and when delegating beats doing it inline.",
        href: "https://code.claude.com/docs/en/sub-agents",
        source: DOCS,
      },
      {
        id: "agents-teams",
        title: "Agent teams",
        detail:
          "Several sessions working in parallel and talking to each other; know the cost before you try.",
        href: "https://code.claude.com/docs/en/agent-teams",
        source: DOCS,
      },
      {
        id: "agents-costs",
        title: "Managing costs",
        detail: "Where tokens go, why parallel agents multiply them, and how to read your usage.",
        href: "https://code.claude.com/docs/en/costs",
        source: DOCS,
      },
    ],
    build: {
      id: "build-agents",
      name: "Workflow v0.5 — a reviewer that has not seen your reasoning",
      blurb:
        "A read-only reviewer subagent that gets the diff and the repo rules and nothing else. Compare what it catches against your own read of the same change.",
      proves: ["Context isolation", "Least-privilege tools", "A second opinion on demand"],
      example: {
        file: ".claude/agents/reviewer.md",
        code: `---
name: reviewer
description: Reviews the current diff for bugs and rule violations. Use before committing.
tools: Read, Grep, Glob, Bash
---

You review code you did not write. Run \`git diff\`, then read what it touches.
Report only real problems: a wrong result, a crash, a broken feature boundary.
For each: file, line, the input that breaks it. If there are none, say so.`,
      },
    },
  },
  {
    id: "mcp",
    number: "06",
    title: "Outside tools",
    weeks: "1 week",
    goal: "Let the workflow read the ticket and the design instead of you pasting them in.",
    accent: "#0f766e",
    steps: [
      {
        id: "mcp-claude-code",
        title: "Connect Claude Code to MCP",
        detail: "Add a server, scope it to a project, and check the permissions it asks for.",
        href: "https://code.claude.com/docs/en/mcp",
        source: DOCS,
      },
      {
        id: "mcp-intro",
        title: "What MCP is",
        detail: "Servers, tools, resources: enough of the protocol to debug a connection.",
        href: "https://modelcontextprotocol.io/introduction",
        source: "Model Context Protocol",
      },
    ],
    build: {
      id: "build-mcp",
      name: "Workflow v0.6 — start from the ticket",
      blurb:
        "Connect the tracker you actually use. “Do ENG-123” should read the ticket, make a branch and plan the change without you copying a word.",
      proves: ["A project-scoped MCP server", "Reading from a real system", "Trust boundaries"],
    },
  },
  {
    id: "unattended",
    number: "07",
    title: "Unattended runs",
    weeks: "2 weeks",
    goal: "Run the same workflow with nobody at the keyboard: from a script, then from CI, with the permissions it needs and no more.",
    accent: "#c2410c",
    steps: [
      {
        id: "unattended-headless",
        title: "Headless mode",
        detail: "claude -p, JSON output, piping input and chaining runs from a shell script.",
        href: "https://code.claude.com/docs/en/headless",
        source: DOCS,
      },
      {
        id: "unattended-actions",
        title: "GitHub Actions",
        detail: "Review a pull request or answer an @claude mention from a workflow file.",
        href: "https://code.claude.com/docs/en/github-actions",
        source: DOCS,
      },
    ],
    build: {
      id: "build-unattended",
      name: "Workflow v0.7 — review every pull request",
      blurb:
        "A GitHub Action that runs the reviewer on each PR and comments. Start read-only, run it on ten old PRs, and only then turn it on for new ones.",
      proves: [
        "Non-interactive runs",
        "Least-privilege tokens",
        "Judging output on old data first",
      ],
      example: {
        file: "terminal",
        code: `git diff main...HEAD | claude -p "Review this diff for bugs. Reply as a list of file:line: problem." \\
  --output-format json`,
      },
    },
  },
  {
    id: "package",
    number: "08",
    title: "Package and extend",
    weeks: "2 weeks",
    goal: "Share the workflow with a team as one install, and reach for the SDK when a shell script stops being enough.",
    accent: "#a21caf",
    bonus: true,
    steps: [
      {
        id: "package-plugins",
        title: "Plugins",
        detail: "Bundle skills, agents, hooks and MCP servers into one thing to install.",
        href: "https://code.claude.com/docs/en/plugins",
        source: DOCS,
      },
      {
        id: "package-marketplaces",
        title: "Plugin marketplaces",
        detail: "Publish and version a plugin so a team installs it with one command.",
        href: "https://code.claude.com/docs/en/plugin-marketplaces",
        source: DOCS,
      },
      {
        id: "package-sdk",
        title: "Agent SDK",
        detail: "The same loop as a library, for custom tools, your own UI or a service.",
        href: "https://code.claude.com/docs/en/agent-sdk/overview",
        source: SDK,
      },
    ],
    build: {
      id: "build-package",
      name: "Workflow v1.0 — one install for the team",
      blurb:
        "Move the skill, reviewer, hooks and settings into a plugin with a README. A colleague should get the whole workflow in two commands.",
      proves: ["A distributable workflow", "A clear README", "The line between plugin and SDK"],
    },
  },
];

export const RULES: readonly string[] = [
  "If it must happen every time, it is a hook. If it should usually happen, it is CLAUDE.md.",
  "Start read-only. Add write access one tool at a time, and only after you have watched it run.",
  "Commit .claude/ to the repo. A workflow nobody else can read is a habit, not a workflow.",
  "Judge each automation on old, real work before it touches new work.",
  "Every parallel agent is a multiplier on cost. Measure one run before you fan out.",
];

export const CLAUDE_CODE_PLAN: Plan = {
  kicker: "CLAUDE CODE · SKILLS · HOOKS · SUBAGENTS · MCP",
  title: "One workflow, built in layers.",
  intro:
    "A plan to automate the daily loop of a developer: pick up a ticket, change the code, check it, get it reviewed. Each phase adds one layer to the same workflow and ends with a version of it you can run. Each step links to the one page worth reading. Tick things off as you go.",
  phases: PHASES,
  rules: RULES,
  rulesTitle: "How to keep it trustworthy.",
  others: [
    { href: "/ai-workflow/mobile-feature", label: "Grow it from a mobile feature →" },
    { href: "/ai-workflow/no-code", label: "No-code with n8n →" },
  ],
};
