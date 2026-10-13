"use client";

import { useEffect, useRef, useState } from "react";

interface CopyEmailButtonProps {
  email: string;
}

const RESET_AFTER_MS = 2000;

/** Shows the email address and copies it to the clipboard on click, with visible feedback. */
export function CopyEmailButton({ email }: CopyEmailButtonProps) {
  const [copied, setCopied] = useState(false);
  const timer = useRef<ReturnType<typeof setTimeout>>(undefined);

  useEffect(() => () => clearTimeout(timer.current), []);

  async function copy() {
    try {
      await navigator.clipboard.writeText(email);
    } catch {
      return; // Clipboard unavailable (e.g. insecure context): the address is still visible.
    }
    setCopied(true);
    clearTimeout(timer.current);
    timer.current = setTimeout(() => setCopied(false), RESET_AFTER_MS);
  }

  return (
    <button
      type="button"
      onClick={copy}
      className="group inline-flex items-center gap-3 rounded-full border border-white/20 px-6 py-4 font-mono text-sm text-zinc-200 transition-colors hover:border-white/50 hover:bg-white/5 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-white"
    >
      <span>{email}</span>
      <span aria-hidden="true" className="relative grid size-5 place-items-center">
        {/* Copy icon, swapped for a check mark while "copied". */}
        <svg
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth="2"
          strokeLinecap="round"
          strokeLinejoin="round"
          className={`absolute size-5 text-zinc-400 transition-all duration-200 group-hover:text-white ${
            copied ? "scale-50 opacity-0" : "scale-100 opacity-100"
          }`}
        >
          <rect x="9" y="9" width="11" height="11" rx="2" />
          <path d="M5 15V6a2 2 0 0 1 2-2h9" />
        </svg>
        <svg
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth="2.5"
          strokeLinecap="round"
          strokeLinejoin="round"
          className={`absolute size-5 text-[#00b96b] transition-all duration-200 ${
            copied ? "scale-100 opacity-100" : "scale-50 opacity-0"
          }`}
        >
          <path d="m5 12 5 5 9-10" />
        </svg>
      </span>
      <span className="sr-only" aria-live="polite">
        {copied ? "Email address copied to clipboard" : "Copy email address"}
      </span>
    </button>
  );
}
