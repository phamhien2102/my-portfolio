"use client";

import { SITE } from "@/config/site";

/**
 * Opens the browser's print dialog, where "Save as PDF" produces the resume. Only the resume is
 * printed (everything else is hidden by print styles). The page title becomes the suggested file
 * name while the dialog is open.
 */
export function PrintResumeButton() {
  const print = () => {
    const previousTitle = document.title;
    document.title = `${SITE.name} - Resume`;
    window.addEventListener("afterprint", () => (document.title = previousTitle), { once: true });
    window.print();
  };

  return (
    <button
      type="button"
      onClick={print}
      className="group inline-flex items-center gap-3 rounded-full border border-white/20 px-6 py-4 font-mono text-sm tracking-widest text-zinc-200 uppercase transition-colors hover:border-white/50 hover:bg-white/5 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-white"
    >
      Resume (PDF)
      <svg
        aria-hidden="true"
        viewBox="0 0 24 24"
        fill="none"
        stroke="currentColor"
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
        className="size-5 text-zinc-400 transition-[color,translate] duration-300 group-hover:translate-y-0.5 group-hover:text-white motion-reduce:transition-none"
      >
        <path d="M12 4v11" />
        <path d="m7 11 5 5 5-5" />
        <path d="M5 20h14" />
      </svg>
    </button>
  );
}
