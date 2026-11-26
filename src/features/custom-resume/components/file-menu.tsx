"use client";

import { useEffect, useRef, useState, type ReactNode } from "react";

import { Icon } from "./fields";

interface Props {
  onImport: () => void;
  onExportPdf: () => void;
  onExportWord: () => void;
  onSample: () => void;
  onBlank: () => void;
  pdfDisabled: boolean;
  pdfBusy: boolean;
  wordBusy: boolean;
}

/** Import, export and "start over" in one place, so the top bar stays short. */
export function FileMenu(p: Props) {
  const [open, setOpen] = useState(false);
  const box = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!open) return;
    const onDown = (e: PointerEvent) => {
      if (!box.current?.contains(e.target as Node)) setOpen(false);
    };
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") setOpen(false);
    };
    document.addEventListener("pointerdown", onDown);
    document.addEventListener("keydown", onKey);
    return () => {
      document.removeEventListener("pointerdown", onDown);
      document.removeEventListener("keydown", onKey);
    };
  }, [open]);

  const run = (fn: () => void) => () => {
    setOpen(false);
    fn();
  };

  return (
    <div ref={box} className="relative">
      <button
        type="button"
        className="ra-btn primary"
        aria-haspopup="menu"
        aria-expanded={open}
        data-testid="file-menu"
        onClick={() => setOpen((o) => !o)}
      >
        File
        <span className={`transition ${open ? "rotate-180" : ""}`}>{Icon.chevron}</span>
      </button>
      {open ? (
        <div
          role="menu"
          className="absolute right-0 z-40 mt-1.5 w-80 max-w-[calc(100vw-1.5rem)] rounded-[12px] border-[1.5px] border-[var(--ink)] bg-[var(--card)] p-1.5 text-sm shadow-[var(--pop)]"
        >
          <Group label="Import">
            <Item
              icon={Icon.upload}
              onClick={run(p.onImport)}
              hint="From this app"
              testId="menu-import"
            >
              Import PDF…
            </Item>
          </Group>
          <Group label="Export">
            <Item
              icon={Icon.download}
              onClick={run(p.onExportPdf)}
              disabled={p.pdfDisabled || p.pdfBusy}
              hint={p.pdfBusy ? "Creating…" : "Exact, re-importable"}
              testId="export-pdf"
            >
              Download PDF
            </Item>
            <Item
              icon={Icon.download}
              onClick={run(p.onExportWord)}
              disabled={p.wordBusy}
              hint={p.wordBusy ? "Creating…" : "Editable (.docx)"}
              testId="export-docx"
            >
              Download Word
            </Item>
          </Group>
          <Group label="Document" last>
            <Item onClick={run(p.onSample)}>Use the sample CV again</Item>
            <Item onClick={run(p.onBlank)}>Start a blank CV</Item>
          </Group>
        </div>
      ) : null}
    </div>
  );
}

function Group({ label, children, last }: { label: string; children: ReactNode; last?: boolean }) {
  return (
    <div className={last ? "" : "mb-1 border-b border-[var(--line)] pb-1"}>
      <p className="px-2.5 pt-1.5 pb-0.5 text-[10px] font-extrabold tracking-wider text-[var(--muted)] uppercase">
        {label}
      </p>
      {children}
    </div>
  );
}

function Item({
  children,
  onClick,
  icon,
  hint,
  disabled,
  testId,
}: {
  children: ReactNode;
  onClick: () => void;
  icon?: ReactNode;
  hint?: string;
  disabled?: boolean;
  testId?: string;
}) {
  return (
    <button
      type="button"
      role="menuitem"
      disabled={disabled}
      onClick={onClick}
      data-testid={testId}
      className="flex w-full items-center gap-2 rounded-[10px] px-2.5 py-2 text-left hover:bg-[var(--tile)] disabled:opacity-50 disabled:hover:bg-transparent"
    >
      {icon ? <span className="text-[var(--muted)]">{icon}</span> : null}
      <span className="flex-1 whitespace-nowrap">{children}</span>
      {hint ? <span className="text-[10px] text-[var(--muted)]">{hint}</span> : null}
    </button>
  );
}
