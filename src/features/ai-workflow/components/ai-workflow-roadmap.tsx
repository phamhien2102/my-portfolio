import Link from "next/link";

import type { Plan } from "../data";
import { RoadmapBoard } from "./roadmap-board";

/** /ai-workflow and its siblings: a roadmap for building one AI workflow, a layer per phase. */
export function AiWorkflowRoadmap({ plan }: { plan: Plan }) {
  const weeks = plan.phases.reduce((n, p) => n + Number.parseInt(p.weeks, 10), 0);
  const facts = [
    { value: String(plan.phases.length), label: "phases" },
    { value: `${weeks}w`, label: "end to end" },
    { value: "1", label: "workflow, grown a layer at a time" },
  ];
  return (
    <main
      data-page-theme="light"
      className="min-h-svh bg-white px-5 py-16 text-zinc-900 [color-scheme:light] sm:px-8"
    >
      <div className="mx-auto max-w-5xl">
        <Link
          href="/"
          className="font-mono text-xs tracking-[0.25em] text-zinc-400 hover:text-zinc-900"
        >
          ← RAYMOND PHAM
        </Link>

        <nav aria-label="Other plans" className="mt-6 flex flex-wrap gap-x-6 gap-y-2">
          {plan.others.map((other) => (
            <Link
              key={other.href}
              href={other.href}
              className="font-mono text-xs tracking-[0.2em] text-zinc-500 underline-offset-4 hover:text-zinc-900 hover:underline"
            >
              {other.label}
            </Link>
          ))}
        </nav>

        <p className="mt-6 font-mono text-xs tracking-[0.3em] text-zinc-500">{plan.kicker}</p>
        <h1 className="mt-3 text-4xl font-black tracking-tight sm:text-6xl">{plan.title}</h1>
        <p className="mt-4 max-w-2xl text-zinc-600">{plan.intro}</p>

        <dl className="mt-8 flex flex-wrap gap-x-10 gap-y-4">
          {facts.map((fact) => (
            <div key={fact.label}>
              <dt className="sr-only">{fact.label}</dt>
              <dd>
                <span className="font-mono text-2xl font-black tabular-nums">{fact.value}</span>
                <span className="ml-2 text-sm text-zinc-500">{fact.label}</span>
              </dd>
            </div>
          ))}
        </dl>

        {plan.compare && (
          <section className="mt-12" aria-labelledby="compare">
            <p className="font-mono text-xs tracking-[0.3em] text-zinc-500">CHOOSE A TOOL</p>
            <h2 id="compare" className="mt-3 text-2xl font-black tracking-tight sm:text-4xl">
              {plan.compare.title}
            </h2>
            <p className="mt-3 max-w-2xl text-zinc-600">{plan.compare.intro}</p>
            <div className="mt-6 overflow-x-auto rounded-2xl border border-zinc-200">
              <table className="w-full min-w-[720px] text-left text-sm">
                <thead className="bg-zinc-50 font-mono text-[11px] tracking-wider text-zinc-500">
                  <tr>
                    <th className="p-3">TOOL</th>
                    <th className="p-3">FITS BEST</th>
                    <th className="p-3">TRADE-OFF</th>
                    <th className="p-3">RUNS</th>
                  </tr>
                </thead>
                <tbody>
                  {plan.compare.rows.map((row) => (
                    <tr key={row.tool} className="border-t border-zinc-200 align-top">
                      <td className="p-3 font-bold">{row.tool}</td>
                      <td className="p-3 text-zinc-600">{row.fits}</td>
                      <td className="p-3 text-zinc-600">{row.tradeoff}</td>
                      <td className="p-3 text-zinc-600">{row.hosting}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </section>
        )}

        <RoadmapBoard phases={plan.phases} />

        <section className="mt-20" aria-labelledby="rules">
          <p className="font-mono text-xs tracking-[0.3em] text-zinc-500">HOUSE RULES</p>
          <h2 id="rules" className="mt-3 text-2xl font-black tracking-tight sm:text-4xl">
            {plan.rulesTitle}
          </h2>
          <ol className="mt-6 space-y-3">
            {plan.rules.map((rule, index) => (
              <li
                key={rule}
                className="flex gap-4 rounded-2xl border border-zinc-200 bg-white p-4 shadow-sm"
              >
                <span className="font-mono text-sm text-zinc-400 tabular-nums">
                  {String(index + 1).padStart(2, "0")}
                </span>
                <span className="text-zinc-700">{rule}</span>
              </li>
            ))}
          </ol>
        </section>

        <p className="mt-20 font-mono text-xs tracking-wider text-zinc-400">
          A private page. Not linked from anywhere, not in search results.
        </p>
      </div>
    </main>
  );
}
