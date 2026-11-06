/**
 * The no-code sibling of the Claude Code plan: the same idea (one workflow, a layer per phase)
 * built in n8n. The running example is this site's contact form, because it already has a real
 * input and a real person to answer. Make, Zapier and Dify get a mention where they differ.
 *
 * Every link was checked with curl.
 */

import type { Phase, Plan } from "./data";

const N8N = "n8n docs";
const DIFY = "Dify docs";
const ANTHROPIC = "Anthropic docs";

const PHASES: readonly Phase[] = [
  {
    id: "nc-first-flow",
    number: "01",
    title: "A first flow, no AI",
    weeks: "1 week",
    goal: "Learn what a trigger, a node and an execution are before any model is involved. Most bugs later are plumbing, not prompts.",
    accent: "#0369a1",
    steps: [
      {
        id: "nc-try",
        title: "n8n quickstart",
        detail:
          "Build and run a workflow in the editor; read an execution to see each node's input and output.",
        href: "https://docs.n8n.io/try-it-out/",
        source: N8N,
      },
      {
        id: "nc-webhook",
        title: "Webhook trigger",
        detail:
          "A URL that starts the workflow. Test URL against production URL, and what the body looks like.",
        href: "https://docs.n8n.io/integrations/builtin/core-nodes/n8n-nodes-base.webhook/",
        source: N8N,
      },
      {
        id: "nc-make",
        title: "Make: help centre",
        detail:
          "Skim how scenarios, modules and operations map to what you just built. Same ideas, other names.",
        href: "https://help.make.com/",
        source: "Make",
      },
      {
        id: "nc-zapier",
        title: "Zapier: help centre",
        detail:
          "Zaps, triggers and actions. Note how much is hidden from you, and what that costs you later.",
        href: "https://help.zapier.com/hc/en-us",
        source: "Zapier",
      },
    ],
    build: {
      id: "nc-build-1",
      name: "Workflow v0.1 — a form that pings you",
      blurb:
        "A webhook receives name, email and message from curl, and a notification node tells you in your chat or inbox. Nothing smart, but it runs end to end.",
      proves: ["Trigger to action", "Reading an execution", "Test and production URLs"],
    },
  },
  {
    id: "nc-logic",
    number: "02",
    title: "Data and logic",
    weeks: "1 week",
    goal: "Move fields around, branch on them and call anything with an API. This is what every AI step will sit between.",
    accent: "#4d7c0f",
    steps: [
      {
        id: "nc-expressions",
        title: "Expressions",
        detail:
          "Pull a field from an earlier node with {{ }}, and tell a string from a number before it bites.",
        href: "https://docs.n8n.io/code/expressions/",
        source: N8N,
      },
      {
        id: "nc-if",
        title: "IF node",
        detail: "Two branches from one condition, and what happens to items that match neither.",
        href: "https://docs.n8n.io/integrations/builtin/core-nodes/n8n-nodes-base.if/",
        source: N8N,
      },
      {
        id: "nc-http",
        title: "HTTP Request node",
        detail:
          "The escape hatch: any service without a ready-made node, with headers and a body you control.",
        href: "https://docs.n8n.io/integrations/builtin/core-nodes/n8n-nodes-base.httprequest/",
        source: N8N,
      },
    ],
    build: {
      id: "nc-build-2",
      name: "Workflow v0.2 — route by plain rules",
      blurb:
        "Messages that mention hiring go one way, everything else another, using only keywords. Keep this version: it is the baseline the AI has to beat.",
      proves: ["Branching", "Field mapping", "A non-AI baseline to compare against"],
    },
  },
  {
    id: "nc-first-ai",
    number: "03",
    title: "The first AI step",
    weeks: "1 week",
    goal: "Treat the model as a function that takes text and returns structured data. Everything downstream depends on that data being shaped the same every time.",
    accent: "#b45309",
    steps: [
      {
        id: "nc-claude-node",
        title: "Anthropic Chat Model node",
        detail: "Connect your key once as a credential, pick a model, and see what the node sends.",
        href: "https://docs.n8n.io/integrations/builtin/cluster-nodes/sub-nodes/n8n-nodes-langchain.lmchatanthropic/",
        source: N8N,
      },
      {
        id: "nc-classifier",
        title: "Text Classifier",
        detail: "Sort an input into categories you define, with each category on its own output.",
        href: "https://docs.n8n.io/integrations/builtin/cluster-nodes/root-nodes/n8n-nodes-langchain.text-classifier/",
        source: N8N,
      },
      {
        id: "nc-extractor",
        title: "Information Extractor",
        detail: "Pull named fields out of free text against a schema you provide.",
        href: "https://docs.n8n.io/integrations/builtin/cluster-nodes/root-nodes/n8n-nodes-langchain.information-extractor/",
        source: N8N,
      },
      {
        id: "nc-parser",
        title: "Structured Output Parser",
        detail: "Force a JSON shape on a model's answer so the next node can rely on it.",
        href: "https://docs.n8n.io/integrations/builtin/cluster-nodes/sub-nodes/n8n-nodes-langchain.outputparserstructured/",
        source: N8N,
      },
      {
        id: "nc-prompting",
        title: "Prompt engineering overview",
        detail: "Be specific, give examples, say what to do when the input does not fit.",
        href: "https://docs.anthropic.com/en/docs/build-with-claude/prompt-engineering/overview",
        source: ANTHROPIC,
      },
    ],
    build: {
      id: "nc-build-3",
      name: "Workflow v0.3 — sort the message",
      blurb:
        "A model labels each message as recruiter, collaboration, client or spam, rates urgency and writes a 20-word summary. Run it on 30 real or invented messages and score it against your v0.2 keywords.",
      proves: [
        "JSON out of a model",
        "A prompt written like a spec",
        "Measured against a baseline",
      ],
      example: {
        file: "the prompt in the AI node",
        code: `You sort messages sent through a portfolio contact form.
Return only JSON matching this shape:
{"category": "recruiter" | "collaboration" | "client" | "spam",
 "urgency": 1 | 2 | 3,
 "summary": "at most 20 words"}
If the message fits no category, use "spam" and urgency 1.

Message from {{ $json.body.name }}:
{{ $json.body.message }}`,
      },
    },
  },
  {
    id: "nc-draft",
    number: "04",
    title: "Draft a reply",
    weeks: "1 week",
    goal: "Let the model write, but only from facts you gave it. The prompt carries the facts, not the model's memory.",
    accent: "#be185d",
    steps: [
      {
        id: "nc-chain",
        title: "Basic LLM Chain",
        detail: "A plain prompt in, text out. No agent, no tools, and often all you need.",
        href: "https://docs.n8n.io/integrations/builtin/cluster-nodes/root-nodes/n8n-nodes-langchain.chainllm/",
        source: N8N,
      },
      {
        id: "nc-dify-llm",
        title: "Dify: LLM node",
        detail:
          "Build the same step in Dify and compare: prompt editor, variables, and a run log per step.",
        href: "https://docs.dify.ai/en/use-dify/nodes/llm",
        source: DIFY,
      },
      {
        id: "nc-messages",
        title: "The Messages API",
        detail:
          "What the node sends underneath: system prompt, messages, max tokens. Read it once.",
        href: "https://docs.anthropic.com/en/api/messages",
        source: ANTHROPIC,
      },
    ],
    build: {
      id: "nc-build-4",
      name: "Workflow v0.4 — a reply in your voice",
      blurb:
        "For recruiter and client messages, draft a short answer using a block of facts you paste into the prompt: availability, rates, links. If the facts do not cover the question, the draft must say so rather than guess.",
      proves: [
        "Grounding by prompt",
        "“I don't know” as an allowed answer",
        "The same step in two tools",
      ],
    },
  },
  {
    id: "nc-human",
    number: "05",
    title: "A human in the loop",
    weeks: "1 week",
    goal: "No draft leaves the building without a yes from you. Pausing a workflow and resuming it is the feature that makes AI safe to wire up.",
    accent: "#6d28d9",
    steps: [
      {
        id: "nc-wait",
        title: "Wait node",
        detail:
          "Pause an execution until a webhook or a form is hit, then continue with the answer.",
        href: "https://docs.n8n.io/integrations/builtin/core-nodes/n8n-nodes-base.wait/",
        source: N8N,
      },
      {
        id: "nc-switch",
        title: "Switch node",
        detail: "Approve, edit or reject as three paths from one decision.",
        href: "https://docs.n8n.io/integrations/builtin/core-nodes/n8n-nodes-base.switch/",
        source: N8N,
      },
    ],
    build: {
      id: "nc-build-5",
      name: "Workflow v0.5 — approve before it sends",
      blurb:
        "The draft arrives in your chat or inbox with Approve and Reject links. Only Approve sends it. Keep a note of how often you edit before approving: that number says when automation is ready.",
      proves: ["Pause and resume", "Three-way decision", "A measure of trust"],
    },
  },
  {
    id: "nc-reliable",
    number: "06",
    title: "When it breaks",
    weeks: "1 week",
    goal: "Models time out, return the wrong shape and run up bills. Decide in advance what the workflow does each time.",
    accent: "#0f766e",
    steps: [
      {
        id: "nc-errors",
        title: "Error handling",
        detail: "Per-node settings (retry, continue) and a whole-workflow error path.",
        href: "https://docs.n8n.io/flow-logic/error-handling/",
        source: N8N,
      },
      {
        id: "nc-error-trigger",
        title: "Error Trigger",
        detail: "A second workflow that starts when the first fails, and tells you what and where.",
        href: "https://docs.n8n.io/integrations/builtin/core-nodes/n8n-nodes-base.errortrigger/",
        source: N8N,
      },
      {
        id: "nc-structured",
        title: "Structured outputs",
        detail:
          "Why a JSON answer can still be wrong, and how to check it before a node trusts it.",
        href: "https://docs.anthropic.com/en/docs/build-with-claude/structured-outputs",
        source: ANTHROPIC,
      },
      {
        id: "nc-make-errors",
        title: "Make: error handling",
        detail:
          "Routes and directives for the same problem; a good idea to steal even if you stay on n8n.",
        href: "https://help.make.com/error-handling",
        source: "Make",
      },
    ],
    build: {
      id: "nc-build-6",
      name: "Workflow v0.6 — fails loudly, never silently",
      blurb:
        "A bad JSON answer retries once, then falls back to “needs a human”. Any failure sends you one message naming the step. Break each node on purpose and check you get that message.",
      proves: ["Retries and fallbacks", "An error workflow", "Testing failure on purpose"],
    },
  },
  {
    id: "nc-agents",
    number: "07",
    title: "Agents and tools",
    weeks: "2 weeks",
    goal: "Let the model choose a tool instead of following a fixed path, and learn when a fixed path was the better design.",
    accent: "#c2410c",
    bonus: true,
    steps: [
      {
        id: "nc-agent-node",
        title: "AI Agent node",
        detail: "A model with tools and memory that decides its own next step.",
        href: "https://docs.n8n.io/integrations/builtin/cluster-nodes/root-nodes/n8n-nodes-langchain.agent/",
        source: N8N,
      },
      {
        id: "nc-agent-concepts",
        title: "Understand agents",
        detail: "What an agent adds over a chain, and what it costs in predictability.",
        href: "https://docs.n8n.io/advanced-ai/examples/understand-agents/",
        source: N8N,
      },
      {
        id: "nc-dify-agent",
        title: "Dify: Agent node",
        detail: "The same pattern in Dify, with its own tool and strategy options.",
        href: "https://docs.dify.ai/en/use-dify/nodes/agent",
        source: DIFY,
      },
    ],
    build: {
      id: "nc-build-7",
      name: "Workflow v0.7 — proposes two time slots",
      blurb:
        "Give the drafting step one tool, your calendar's free slots, and have the reply offer two. Compare it with the fixed v0.5 path on the same ten messages before you keep it.",
      proves: ["A tool the model can call", "Agent against fixed path", "Judging by evidence"],
    },
  },
  {
    id: "nc-ship",
    number: "08",
    title: "Run it for real",
    weeks: "1 week",
    goal: "Move from an editor on your laptop to something that is on all the time, safe to point your live site at.",
    accent: "#a21caf",
    steps: [
      {
        id: "nc-hosting",
        title: "Hosting n8n",
        detail: "Cloud or self-hosted, and what you take on yourself in the second case.",
        href: "https://docs.n8n.io/hosting/",
        source: N8N,
      },
      {
        id: "nc-docker",
        title: "Install with Docker",
        detail: "A small server and a volume that is backed up. Do not skip the volume.",
        href: "https://docs.n8n.io/hosting/installation/docker/",
        source: N8N,
      },
      {
        id: "nc-credentials",
        title: "Credentials",
        detail: "Keys live in credentials, never pasted into a node, a prompt or an exported file.",
        href: "https://docs.n8n.io/credentials/",
        source: N8N,
      },
      {
        id: "nc-export",
        title: "Export and import",
        detail: "A workflow is JSON. Put it in git so a change has a history and a way back.",
        href: "https://docs.n8n.io/workflows/export-import/",
        source: N8N,
      },
    ],
    build: {
      id: "nc-build-8",
      name: "Workflow v1.0 — the live contact form",
      blurb:
        "Point the real form at the production webhook from server code, behind a secret header. Send ten real messages through, read every execution, and only then tell anyone it is on.",
      proves: [
        "A protected public endpoint",
        "Secrets out of the browser",
        "The workflow in version control",
      ],
      example: {
        file: "a server action, never client code",
        code: `await fetch(process.env.N8N_WEBHOOK_URL!, {
  method: "POST",
  headers: {
    "content-type": "application/json",
    // The Webhook node checks this with a Header Auth credential.
    "x-webhook-secret": process.env.N8N_WEBHOOK_SECRET!,
  },
  body: JSON.stringify({ name, email, message }),
});`,
      },
    },
  },
];

export const NO_CODE_PLAN: Plan = {
  kicker: "N8N · MAKE · ZAPIER · DIFY",
  title: "One automation, no server of your own.",
  intro:
    "The same idea as the Claude Code plan, with a canvas instead of an editor: one workflow, a layer per phase. The example is this site's contact form. It starts as a notification and ends as a sorted, drafted, human-approved reply. The steps use n8n; the table says when another tool is the better choice.",
  phases: PHASES,
  rulesTitle: "How to avoid the usual mess.",
  rules: [
    "Build the whole path with no AI first. Then add the model at one node, so you know what it changed.",
    "Make every AI step return JSON and check it before any other node trusts it.",
    "Do not let a model send anything until a person has approved fifty of its drafts without editing.",
    "Keys live in credentials; the webhook needs a secret. The editor is not a safe place to paste either.",
    "Export the workflow to git after each change. Visual tools are bad at remembering what you did.",
    "Count executions and tokens per message. Free tiers and prompts both run out sooner than you expect.",
  ],
  compare: {
    title: "Four tools, four different jobs.",
    intro:
      "Learn on one and keep the others in mind. Plans and prices change, so check the current pricing page before you commit to any of them.",
    rows: [
      {
        tool: "n8n",
        fits: "Workflows with real branching, code steps and built-in AI nodes (agents, classifiers, parsers).",
        tradeoff: "More to learn at the start; you own the server if you self-host.",
        hosting: "Their cloud, or your own server (fair-code licence)",
      },
      {
        tool: "Make",
        fits: "Visual scenarios that move and reshape data between many apps.",
        tradeoff: "Usage is metered per operation, so loops over lists get expensive.",
        hosting: "Their cloud only",
      },
      {
        tool: "Zapier",
        fits: "The quickest route from idea to a working automation, across the largest list of apps.",
        tradeoff: "Least control over complex logic; cost grows with task count.",
        hosting: "Their cloud only",
      },
      {
        tool: "Dify",
        fits: "Apps whose centre is the model: chatbots, document question-answering, agents with a knowledge base.",
        tradeoff: "Less suited to wiring many ordinary apps together.",
        hosting: "Their cloud, or your own server (open source)",
      },
    ],
  },
  others: [
    { href: "/ai-workflow", label: "← Claude Code, layer by layer" },
    { href: "/ai-workflow/mobile-feature", label: "Grow it from a mobile feature →" },
  ],
};
