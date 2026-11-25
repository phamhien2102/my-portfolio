import { JetBrains_Mono } from "next/font/google";
import Link from "next/link";
import type { ReactNode } from "react";

import "../algorithms.css";

const mono = JetBrains_Mono({
  subsets: ["latin", "vietnamese"],
  variable: "--font-jbm",
  display: "swap",
});

/**
 * The frame of every /algorithms page, dressed like /ielts: warm paper, monospace type, a slim top
 * bar and one big sheet that holds the content. A light page, so it opts out of the dark shell.
 */
export function AlgShell({
  back,
  children,
}: {
  /** The link on the right of the top bar, if the page has somewhere to go back to. */
  back?: { href: string; label: string };
  children: ReactNode;
}) {
  return (
    <div data-page-theme="light" className={`alg-app ${mono.variable}`}>
      <header className="alg-topbar">
        <Link href="/algorithms" className="alg-brand">
          <span>Algorithm patterns</span>
        </Link>
        {back && (
          <Link href={back.href} className="alg-home">
            {back.label}
          </Link>
        )}
      </header>
      <main className="alg-shell">
        <div className="alg-sheet">{children}</div>
      </main>
    </div>
  );
}
