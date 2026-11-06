import Link from "next/link";
import type { CSSProperties } from "react";

import { accentAt } from "@/config/theme";

import { GROUPS, HIDDEN_PAGES } from "../data";

/** /hide-pages: the way into every page that the home page does not link to. */
export function HiddenPages() {
  const indexed = HIDDEN_PAGES.filter((page) => !page.noindex).length;
  let colour = 0;

  return (
    <main className="min-h-svh px-5 py-16 sm:px-8">
      <div className="mx-auto max-w-5xl">
        <Link
          href="/"
          className="font-mono text-xs tracking-[0.25em] text-zinc-500 hover:text-white"
        >
          ← RAYMOND PHAM
        </Link>

        <p className="mt-10 font-mono text-xs tracking-[0.3em] text-zinc-500">UNLISTED PAGES</p>
        <h1 className="mt-3 text-4xl font-black tracking-tight text-white sm:text-6xl">
          The pages behind the pages.
        </h1>
        <p className="mt-4 max-w-2xl text-zinc-400">
          {HIDDEN_PAGES.length} places that the navigation does not show. Each card says how a
          visitor would find it without being told the address, and whether search engines have been
          asked to skip it.
          {indexed > 0 && (
            <>
              {" "}
              <span className="text-amber-300">
                {indexed} of them {indexed === 1 ? "has" : "have"} no <code>noindex</code>, so{" "}
                {indexed === 1 ? "it" : "they"} can show up in search.
              </span>
            </>
          )}
        </p>

        {GROUPS.map((group) => {
          const pages = HIDDEN_PAGES.filter((page) => page.group === group);
          if (pages.length === 0) return null;
          return (
            <section key={group} className="mt-14" aria-labelledby={`group-${group}`}>
              <h2
                id={`group-${group}`}
                className="font-mono text-xs tracking-[0.3em] text-zinc-500 uppercase"
              >
                {group}
              </h2>
              <ul className="mt-4 grid gap-4 sm:grid-cols-2">
                {pages.map((page) => {
                  const accent = accentAt(colour++ * 3);
                  return (
                    <li
                      key={page.path}
                      style={{ "--accent": accent } as CSSProperties}
                      className="group relative flex flex-col rounded-3xl border border-white/10 bg-white/[0.03] p-6 transition hover:border-[var(--accent)]"
                    >
                      <Link
                        href={page.path}
                        className="font-mono text-sm font-bold text-[var(--accent)] after:absolute after:inset-0 after:rounded-3xl after:content-['']"
                      >
                        {page.path} →
                      </Link>
                      <h3 className="mt-3 text-xl font-black tracking-tight text-white">
                        {page.title}
                      </h3>
                      <p className="mt-2 text-sm text-zinc-400">{page.blurb}</p>

                      <dl className="mt-4 space-y-1 text-sm">
                        <div className="flex gap-2">
                          <dt className="w-16 shrink-0 font-mono text-[11px] tracking-wider text-zinc-500 uppercase">
                            Way in
                          </dt>
                          <dd className="text-zinc-300">{page.access}</dd>
                        </div>
                        <div className="flex gap-2">
                          <dt className="w-16 shrink-0 font-mono text-[11px] tracking-wider text-zinc-500 uppercase">
                            Search
                          </dt>
                          <dd className={page.noindex ? "text-zinc-300" : "text-amber-300"}>
                            {page.noindex ? "Asked to skip (noindex)" : "May be indexed"}
                          </dd>
                        </div>
                      </dl>

                      {page.alsoOpen && (
                        <ul className="relative z-10 mt-4 flex flex-wrap gap-2">
                          {page.alsoOpen.map((link) => (
                            <li key={link.href}>
                              <Link
                                href={link.href}
                                className="rounded-full border border-white/15 px-3 py-1 text-xs text-zinc-300 transition hover:border-white/40 hover:text-white"
                              >
                                {link.label}
                              </Link>
                            </li>
                          ))}
                        </ul>
                      )}
                    </li>
                  );
                })}
              </ul>
            </section>
          );
        })}

        <p className="mt-16 font-mono text-xs tracking-wider text-zinc-600">
          This page is unlisted too: not in the navigation, and asked to stay out of search results.
        </p>
      </div>
    </main>
  );
}
