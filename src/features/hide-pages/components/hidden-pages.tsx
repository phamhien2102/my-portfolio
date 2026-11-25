import { JetBrains_Mono } from "next/font/google";
import Link from "next/link";

import { GROUPS, HIDDEN_PAGES } from "../data";
import "../hide-pages.css";

const mono = JetBrains_Mono({
  subsets: ["latin", "vietnamese"],
  variable: "--font-jbm",
  display: "swap",
});

/**
 * /hide-pages: the way into every page that the home page does not link to. Dressed like /ielts
 * (warm paper, monospace, firm dark edges, colour-coded chips) and, like it, a light page that opts
 * out of the dark shell.
 */
export function HiddenPages() {
  const indexed = HIDDEN_PAGES.filter((page) => !page.noindex).length;
  const skipped = HIDDEN_PAGES.length - indexed;

  return (
    <div data-page-theme="light" className={`hide-app ${mono.variable}`}>
      <header className="hp-topbar">
        <span className="hp-brand">
          <span>Unlisted pages</span>
        </span>
        <Link href="/" className="hp-home">
          ← Raymond Pham
        </Link>
      </header>

      <main className="hp-shell">
        <div className="hp-sheet">
          <div className="hp-banner">
            <p className="hp-eyebrow">Unlisted pages</p>
            <h1>The pages behind the pages.</h1>
            <p className="hp-sub">
              {HIDDEN_PAGES.length} places that the navigation does not show. Each card says how a
              visitor would find it without being told the address, and whether search engines have
              been asked to skip it.
            </p>
            <ul className="hp-chips" aria-label="Summary">
              <li className="hp-chip y">{HIDDEN_PAGES.length} pages</li>
              {skipped > 0 && <li className="hp-chip g">{skipped} asked to skip search</li>}
              {indexed > 0 && <li className="hp-chip v">{indexed} may show in search</li>}
            </ul>
          </div>

          {GROUPS.map((group) => {
            const pages = HIDDEN_PAGES.filter((page) => page.group === group);
            if (pages.length === 0) return null;
            return (
              <section
                key={group}
                className="hp-group"
                data-group={group}
                aria-labelledby={`group-${group}`}
              >
                <h2 id={`group-${group}`}>{group}</h2>
                <ul className="hp-grid">
                  {pages.map((page) => (
                    <li key={page.path} className="hp-card">
                      <Link href={page.path} className="hp-path">
                        {page.path} →
                      </Link>
                      <h3>{page.title}</h3>
                      <p className="hp-blurb">{page.blurb}</p>

                      <dl className="hp-meta">
                        <div>
                          <dt>Way in</dt>
                          <dd>{page.access}</dd>
                        </div>
                        <div>
                          <dt>Search</dt>
                          <dd>
                            <span className={page.noindex ? "hp-tag g" : "hp-tag y"}>
                              {page.noindex ? "noindex" : "may be indexed"}
                            </span>
                          </dd>
                        </div>
                      </dl>

                      {page.alsoOpen && (
                        <ul className="hp-links">
                          {page.alsoOpen.map((link) => (
                            <li key={link.href}>
                              <Link href={link.href}>{link.label}</Link>
                            </li>
                          ))}
                        </ul>
                      )}
                    </li>
                  ))}
                </ul>
              </section>
            );
          })}

          <p className="hp-foot">
            This page is unlisted too: not in the navigation, and asked to stay out of search
            results.
          </p>
        </div>
      </main>
    </div>
  );
}
