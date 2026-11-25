"use client";

import { useEffect, useRef, useState } from "react";

import { cn } from "@/lib/cn";

import { Check, Chevron, Globe } from "./icons";
import { LOCALES, type Locale } from "./i18n";

interface Props {
  locale: Locale;
  onChange: (next: Locale) => void;
  /** The accessible name of the button, in the current language. */
  label: string;
}

/**
 * The language picker in the top bar: a globe, the short code of the current language and an arrow.
 * It opens a short list of the languages, each in its own name. Arrow keys move, Enter picks,
 * Escape and a press anywhere else close it.
 */
export function LanguageMenu({ locale, onChange, label }: Props) {
  const [open, setOpen] = useState(false);
  const rootRef = useRef<HTMLDivElement>(null);
  const buttonRef = useRef<HTMLButtonElement>(null);
  const current = LOCALES.find((l) => l.code === locale) ?? LOCALES[0];

  useEffect(() => {
    if (!open) return;
    const onDown = (event: PointerEvent) => {
      if (!rootRef.current?.contains(event.target as Node)) setOpen(false);
    };
    document.addEventListener("pointerdown", onDown);
    // Put the focus on the language in use, so the arrow keys start from there.
    rootRef.current?.querySelector<HTMLElement>("[aria-checked=true]")?.focus();
    return () => document.removeEventListener("pointerdown", onDown);
  }, [open]);

  const pick = (next: Locale) => {
    onChange(next);
    setOpen(false);
    buttonRef.current?.focus();
  };

  const onKeyDown = (event: React.KeyboardEvent<HTMLUListElement>) => {
    const items = [...event.currentTarget.querySelectorAll<HTMLElement>("[role=menuitemradio]")];
    const at = items.indexOf(document.activeElement as HTMLElement);
    if (event.key === "ArrowDown") items[(at + 1) % items.length]?.focus();
    else if (event.key === "ArrowUp") items[(at - 1 + items.length) % items.length]?.focus();
    else if (event.key === "Escape") {
      setOpen(false);
      buttonRef.current?.focus();
    } else return;
    event.preventDefault();
  };

  return (
    <div className="ds-lang" ref={rootRef}>
      <button
        ref={buttonRef}
        type="button"
        className="ds-lang-btn"
        aria-label={`${label}: ${current.name}`}
        aria-haspopup="menu"
        aria-expanded={open}
        onClick={() => setOpen((o) => !o)}
      >
        <Globe />
        <span className="ds-lang-code">{current.short}</span>
        <Chevron className="ds-lang-chev" />
      </button>
      {open && (
        <ul className="ds-lang-menu" role="menu" aria-label={label} onKeyDown={onKeyDown}>
          {LOCALES.map((l) => (
            <li key={l.code} role="none">
              <button
                type="button"
                role="menuitemradio"
                aria-checked={l.code === locale}
                lang={l.code}
                className={cn("ds-lang-item", l.code === locale && "is-on")}
                onClick={() => pick(l.code)}
              >
                <span>{l.name}</span>
                <b>{l.short}</b>
                {l.code === locale && <Check />}
              </button>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
