import { JetBrains_Mono } from "next/font/google";
import Link from "next/link";
import type { CSSProperties } from "react";

import { PRODUCTS } from "../data";
import { TiltCard } from "./tilt-card";
import "../products.css";

const mono = JetBrains_Mono({
  subsets: ["latin", "vietnamese"],
  variable: "--font-jbm",
  display: "swap",
});

const COUNT_WORDS = [
  "Zero",
  "One",
  "Two",
  "Three",
  "Four",
  "Five",
  "Six",
  "Seven",
  "Eight",
  "Nine",
  "Ten",
];
const countWord = (n: number) => COUNT_WORDS[n] ?? String(n);

/**
 * /products: the front door of the pages that are live. A light page in the same cool
 * blue and teal as the courses it points to, and, like them, it opts out of the dark shell.
 */
export function Products() {
  // The headline counts the products, so adding one to data.ts needs no edit here.
  const title = `${countWord(PRODUCTS.length)} things to try.`;
  const words = title.split(" ");

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

      <div className="pr-deco" aria-hidden="true">
        <i className="pr-ring" />
        <i className="pr-tile" />
        <i className="pr-dots" />
      </div>

      <main className="pr-shell">
        <div className="pr-hero">
          <p className="pr-eyebrow">
            <i className="pr-ping" aria-hidden="true" />
            Now live
          </p>
          <h1 aria-label={title}>
            {words.map((word, i) => (
              <span key={word} aria-hidden="true">
                <span className="pr-word">
                  <span style={{ "--i": i } as CSSProperties}>{word}</span>
                </span>{" "}
              </span>
            ))}
          </h1>
          <p className="pr-sub">
            Small, hands-on courses and tools I built and run myself. Pick one to start; each
            remembers where you stopped.
          </p>
        </div>

        <ul className="pr-grid">
          {PRODUCTS.map((product, index) => (
            <TiltCard key={product.path} tone={product.tone} index={index}>
              <Link
                href={product.path}
                target="_blank"
                rel="noopener noreferrer"
                className="pr-card-link"
                aria-label={`${product.cta} (opens in a new tab)`}
              >
                <span className="pr-path">{product.path}</span>
                <h2>{product.name}</h2>
                <p className="pr-tagline">{product.tagline}</p>
                <p className="pr-blurb">{product.blurb}</p>

                <ul className="pr-facts" aria-label="Facts">
                  {product.facts.map((fact, i) => (
                    <li key={fact} className="pr-chip" style={{ "--c": i } as CSSProperties}>
                      {fact}
                    </li>
                  ))}
                </ul>

                <ul className="pr-points">
                  {product.highlights.map((line) => (
                    <li key={line}>{line}</li>
                  ))}
                </ul>

                <span className="pr-cta">
                  {product.cta} <span className="pr-cta-arrow">→</span>
                </span>
              </Link>
            </TiltCard>
          ))}
        </ul>
      </main>
    </div>
  );
}
