"use client";

import Link from "next/link";
import { useState, type ReactNode } from "react";

import { SITE } from "@/config/site";
import { cn } from "@/lib/cn";

import { PrintResumeButton } from "./print-resume-button";

type Layout = "classic" | "creative";

const LAYOUTS: { id: Layout; label: string }[] = [
  { id: "classic", label: "Classic" },
  { id: "creative", label: "Creative" },
];

interface ResumeViewerProps {
  /** The A4 sheet, shown on screen (and printed) in the classic layout. */
  classic: ReactNode;
  /** The screen-only creative layout. */
  creative: ReactNode;
  /** The A4 sheet in its print-only form, printed while the creative layout is on screen. */
  printable: ReactNode;
}

/**
 * The `/resume` page body: a toolbar with a layout switch and the download button, and the chosen
 * layout. "Download PDF" always prints the classic A4 sheet, because the creative layout is built
 * for the screen.
 */
export function ResumeViewer({ classic, creative, printable }: ResumeViewerProps) {
  const [layout, setLayout] = useState<Layout>("classic");

  return (
    <div
      className={cn(
        "min-h-svh transition-colors duration-300 motion-reduce:transition-none print:bg-white",
        layout === "classic" ? "bg-zinc-900" : "bg-zinc-200",
      )}
    >
      <header className="sticky top-0 z-30 flex flex-wrap items-center justify-between gap-4 border-b border-white/10 bg-black/60 px-6 py-4 backdrop-blur sm:px-10 print:hidden">
        <Link
          href="/"
          className="font-mono text-xs tracking-widest text-zinc-400 uppercase transition-colors hover:text-white focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-white"
        >
          <span aria-hidden="true">&larr; </span>
          {SITE.name}
        </Link>

        <div className="flex flex-wrap items-center gap-3">
          <div
            role="group"
            aria-label="Resume layout"
            className="flex rounded-full border border-white/15 p-1 font-mono text-xs tracking-widest uppercase"
          >
            {LAYOUTS.map((item) => (
              <button
                key={item.id}
                type="button"
                aria-pressed={layout === item.id}
                onClick={() => setLayout(item.id)}
                className={cn(
                  "rounded-full px-4 py-2 transition-colors focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-white motion-reduce:transition-none",
                  layout === item.id ? "bg-white text-black" : "text-zinc-400 hover:text-white",
                )}
              >
                {item.label}
              </button>
            ))}
          </div>
          <PrintResumeButton>Download PDF</PrintResumeButton>
        </div>
      </header>

      {layout === "classic" ? (
        <main className="px-4 py-10 sm:px-10 print:p-0">{classic}</main>
      ) : (
        <>
          <main className="px-4 py-10 sm:px-10 print:hidden">{creative}</main>
          {printable}
        </>
      )}
    </div>
  );
}
