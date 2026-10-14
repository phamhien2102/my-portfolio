"use client";

import { useEffect, useId, useRef, type CSSProperties } from "react";

import { accentAt } from "@/config/theme";
import { cn } from "@/lib/cn";

interface NavItem {
  label: string;
  href: string;
}

interface MobileMenuProps {
  items: readonly NavItem[];
  /** Id of the section currently in view, if any (highlighted in the list). */
  active: string | null;
  className?: string;
}

/** Same width as Tailwind's `sm`, where the inline navigation takes over. */
const INLINE_NAV_QUERY = "(min-width: 640px)";

/**
 * Menu icon that opens a full-screen list of the page sections (phones only).
 *
 * Built on the native `<dialog>`: `showModal()` gives focus trapping, Escape-to-close and an
 * inert page behind it. Choosing a link closes the menu and lets the browser scroll to the section.
 */
export function MobileMenu({ items, active, className }: MobileMenuProps) {
  const dialogRef = useRef<HTMLDialogElement>(null);
  const titleId = useId();

  // If the screen grows past the phone layout while open (rotation), the inline nav takes over.
  useEffect(() => {
    const query = window.matchMedia(INLINE_NAV_QUERY);
    const close = () => {
      if (query.matches) dialogRef.current?.close();
    };
    query.addEventListener("change", close);
    return () => query.removeEventListener("change", close);
  }, []);

  const close = () => dialogRef.current?.close();

  return (
    <div className={className}>
      <button
        type="button"
        aria-label="Open menu"
        aria-haspopup="dialog"
        onClick={() => dialogRef.current?.showModal()}
        className="flex size-8 items-center justify-center rounded-full border border-current/30 opacity-70 transition-opacity hover:opacity-100 focus-visible:opacity-100 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-white motion-reduce:transition-none sm:-mt-1.5"
      >
        <svg
          aria-hidden="true"
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth="2"
          strokeLinecap="round"
          className="size-4"
        >
          <path d="M4 8h16M4 16h16" />
        </svg>
      </button>

      <dialog
        ref={dialogRef}
        aria-labelledby={titleId}
        className="m-0 h-svh max-h-none w-screen max-w-none bg-[#09090e]/95 p-0 font-sans text-white opacity-0 backdrop-blur-md transition-opacity duration-300 backdrop:bg-transparent open:opacity-100 motion-reduce:transition-none starting:open:opacity-0"
      >
        <div className="flex h-full flex-col p-6">
          <div className="flex items-start justify-between">
            <h2
              id={titleId}
              className="font-mono text-[11px] tracking-widest text-zinc-500 uppercase"
            >
              Menu
            </h2>
            <button
              type="button"
              aria-label="Close menu"
              onClick={close}
              className="-mt-1.5 flex size-8 items-center justify-center rounded-full border border-white/30 transition-colors hover:bg-white/10 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-white"
            >
              <svg
                aria-hidden="true"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
                strokeLinecap="round"
                className="size-4"
              >
                <path d="M6 6l12 12M18 6 6 18" />
              </svg>
            </button>
          </div>

          <nav aria-label="Sections" className="my-auto">
            <ul className="space-y-1">
              {items.map((item, i) => {
                const isActive = active === item.href.slice(1);
                return (
                  <li key={item.href}>
                    <a
                      href={item.href}
                      onClick={close}
                      aria-current={isActive ? "location" : undefined}
                      style={{ "--accent": accentAt(i) } as CSSProperties}
                      className={cn(
                        "group flex items-baseline gap-4 py-2 text-4xl font-black tracking-tight transition-colors focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-white motion-reduce:transition-none min-[400px]:text-5xl",
                        isActive ? "text-(--accent)" : "text-white hover:text-(--accent)",
                      )}
                    >
                      <span className="font-mono text-xs font-normal tracking-widest text-zinc-500">
                        {String(i + 1).padStart(2, "0")}
                      </span>
                      {item.label}
                    </a>
                  </li>
                );
              })}
            </ul>
          </nav>
        </div>
      </dialog>
    </div>
  );
}
