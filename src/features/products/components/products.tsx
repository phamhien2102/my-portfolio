import { JetBrains_Mono } from "next/font/google";
import Link from "next/link";

import { PRODUCTS } from "../data";
import "../products.css";

const mono = JetBrains_Mono({
  subsets: ["latin", "vietnamese"],
  variable: "--font-jbm",
  display: "swap",
});

/**
 * /products: the front door of the three pages that are going live. A light page in the same cool
 * blue and teal as the courses it points to, and, like them, it opts out of the dark shell.
 */
export function Products() {
  return (
    <div data-page-theme="light" className={`pr-app ${mono.variable}`}>
      <header className="pr-topbar">
        <span className="pr-brand">
          <span>Raymond&rsquo;s Products</span>
        </span>
        <Link href="/" className="pr-home">
          Raymond Pham
        </Link>
      </header>

      <main className="pr-shell">
        <div className="pr-hero">
          <p className="pr-eyebrow">Now live</p>
          <h1>Three things to learn from.</h1>
          <p className="pr-sub">
            Small, hands-on courses I built and run myself. Pick one to start; each remembers where
            you stopped.
          </p>
        </div>

        <ul className="pr-grid">
          {PRODUCTS.map((product) => (
            <li key={product.path} className="pr-card" data-tone={product.tone}>
              <Link href={product.path} className="pr-card-link" aria-label={product.cta}>
                <span className="pr-path">{product.path}</span>
                <h2>{product.name}</h2>
                <p className="pr-tagline">{product.tagline}</p>
                <p className="pr-blurb">{product.blurb}</p>

                <ul className="pr-facts" aria-label="Facts">
                  {product.facts.map((fact) => (
                    <li key={fact} className="pr-chip">
                      {fact}
                    </li>
                  ))}
                </ul>

                <ul className="pr-points">
                  {product.highlights.map((line) => (
                    <li key={line}>{line}</li>
                  ))}
                </ul>

                <span className="pr-cta">{product.cta} →</span>
              </Link>
            </li>
          ))}
        </ul>
      </main>
    </div>
  );
}
