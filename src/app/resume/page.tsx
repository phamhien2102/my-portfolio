import type { Metadata } from "next";
import Link from "next/link";

import { SITE } from "@/config/site";
import { PrintResumeButton, Resume } from "@/features/resume";

export const metadata: Metadata = {
  title: "Resume",
  description: `Resume of ${SITE.name}.`,
  // Holds personal details (phone, date of birth): keep it out of search results.
  robots: { index: false, follow: false },
};

export default function ResumePage() {
  return (
    <div className="min-h-svh bg-zinc-900 print:bg-white">
      <header className="sticky top-0 z-30 flex flex-wrap items-center justify-between gap-4 border-b border-white/10 bg-zinc-900/90 px-6 py-4 backdrop-blur sm:px-10 print:hidden">
        <Link
          href="/"
          className="font-mono text-xs tracking-widest text-zinc-400 uppercase transition-colors hover:text-white focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-white"
        >
          <span aria-hidden="true">&larr; </span>
          {SITE.name}
        </Link>
        <PrintResumeButton>Download PDF</PrintResumeButton>
      </header>

      <main className="px-4 py-10 sm:px-10 print:p-0">
        <Resume preview />
      </main>
    </div>
  );
}
