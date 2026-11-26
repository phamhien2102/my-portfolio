"use client";

import { useEffect, useRef, useState } from "react";

import { SECTION_LABEL, TEMPLATES } from "../data";
import { setBasic, setSummary, type Doc } from "../lib/actions";
import type { ExtractDraft } from "../lib/text-parse";
import type { BasicKey } from "../types";
import { Field, Icon } from "./fields";

export type ImportView =
  | { kind: "busy"; name: string }
  | { kind: "error"; reason: string }
  | { kind: "review"; draft: ExtractDraft; name: string };

const BASIC_ROWS: { key: BasicKey; label: string }[] = [
  { key: "name", label: "Full name" },
  { key: "title", label: "Job title" },
  { key: "email", label: "Email" },
  { key: "phone", label: "Phone" },
  { key: "location", label: "Location" },
  { key: "website", label: "Website" },
  { key: "linkedin", label: "LinkedIn" },
  { key: "github", label: "GitHub" },
];

const FLAG: Partial<Record<BasicKey, string>> = {
  name: "Full name",
  title: "Job title",
  email: "Email",
  phone: "Phone",
};

/** Shown while a PDF is read, when it cannot be, and for checking a guess before it is applied. */
export function ImportDialog({
  view,
  onClose,
  onApply,
  onPickAnother,
}: {
  view: ImportView;
  onClose: () => void;
  onApply: (doc: Doc) => void;
  onPickAnother: () => void;
}) {
  const ref = useRef<HTMLDialogElement>(null);
  useEffect(() => {
    const d = ref.current;
    if (d && !d.open) d.showModal();
  }, []);

  return (
    <dialog
      ref={ref}
      onClose={onClose}
      onCancel={(e) => {
        if (view.kind === "busy") e.preventDefault();
      }}
      className="m-auto w-[min(640px,calc(100vw-24px))] max-w-none rounded-2xl border border-[var(--line-strong)] bg-[var(--card)] p-0 text-[var(--ink)] shadow-2xl backdrop:bg-[var(--ink)]/50"
      aria-label="Import CV from PDF"
    >
      <div className="flex items-center justify-between border-b border-[var(--line-strong)] px-5 py-3">
        <h2 className="text-base font-semibold">Import CV from PDF</h2>
        {view.kind !== "busy" ? (
          <button
            type="button"
            onClick={() => ref.current?.close()}
            aria-label="Close"
            className="grid h-8 w-8 place-items-center rounded-[10px] text-[var(--muted)] hover:bg-[var(--tile)]"
          >
            {Icon.close}
          </button>
        ) : null}
      </div>

      {view.kind === "busy" ? (
        <div
          className="flex items-center gap-3 px-5 py-8 text-sm text-[var(--muted)]"
          role="status"
        >
          <span className="h-4 w-4 animate-spin rounded-full border-2 border-[var(--line-strong)] border-t-[var(--ink)]" />
          Reading <b className="font-medium text-[var(--ink)]">{view.name}</b>…
        </div>
      ) : null}

      {view.kind === "error" ? (
        <div className="space-y-4 px-5 py-6" data-testid="import-error">
          <p className="rounded-[10px] border border-red-200 bg-red-50 p-3 text-sm text-red-800">
            {view.reason}
          </p>
          <div className="flex justify-end gap-2">
            <button type="button" onClick={onPickAnother} className="ra-btn primary">
              Choose another file
            </button>
          </div>
        </div>
      ) : null}

      {view.kind === "review" ? (
        <Review
          draft={view.draft}
          name={view.name}
          onApply={onApply}
          onCancel={() => ref.current?.close()}
        />
      ) : null}
    </dialog>
  );
}

function Review({
  draft,
  name,
  onApply,
  onCancel,
}: {
  draft: ExtractDraft;
  name: string;
  onApply: (doc: Doc) => void;
  onCancel: () => void;
}) {
  const [doc, setDoc] = useState<Doc>(draft.doc);
  const [extra, setExtra] = useState(draft.unassigned.join("\n"));
  const unsure = new Set(draft.unsure);
  const tpl = TEMPLATES.find((t) => t.id === draft.template)!;
  const apply = () => {
    let d = doc;
    if (extra.trim()) {
      d = setSummary(d, [d.data.summary.trim(), extra.trim()].filter(Boolean).join("\n\n"));
      if (!d.settings.order.includes("summary")) {
        d = { ...d, settings: { ...d.settings, order: ["summary", ...d.settings.order] } };
      }
    }
    onApply(d);
  };

  return (
    <div className="max-h-[78vh] overflow-y-auto" data-testid="import-review">
      <div className="space-y-5 px-5 py-4">
        <div className="rounded-[10px] border border-amber-200 bg-amber-50 p-3 text-sm text-amber-900">
          <p className="font-medium">This PDF has no embedded data.</p>
          <p className="mt-1 text-amber-800">
            I read the text of <b className="font-medium">{name}</b> and guessed its structure.
            Check the fields below before continuing. For an exact restore, import a PDF exported
            from this app.
          </p>
        </div>

        <div className="text-sm text-[var(--ink)]">
          Detected template: <b>{tpl.name}</b>{" "}
          <span className="text-[var(--muted)]">
            ({draft.templateGuess === "layout" ? "from the layout" : "default, not sure"})
          </span>
        </div>

        <div>
          <h3 className="mb-2 text-sm font-semibold">Personal details</h3>
          <div className="grid grid-cols-2 gap-3">
            {BASIC_ROWS.map((r) => {
              const flagged = !!FLAG[r.key] && unsure.has(FLAG[r.key]!);
              return (
                <div
                  key={r.key}
                  className={r.key === "name" || r.key === "location" ? "col-span-2" : ""}
                >
                  <Field
                    label={flagged ? `${r.label} — please check` : r.label}
                    value={doc.data.basics[r.key]}
                    onChange={(v) => setDoc((d) => setBasic(d, r.key, v))}
                  />
                  {flagged ? <div className="-mt-0.5 h-0.5 rounded bg-amber-400" /> : null}
                </div>
              );
            })}
          </div>
        </div>

        <div>
          <h3 className="mb-2 text-sm font-semibold">Sections found</h3>
          {draft.found.length ? (
            <ul className="flex flex-wrap gap-2">
              {draft.found.map((f) => (
                <li
                  key={f.key}
                  className={`rounded-full border px-3 py-1 text-xs ${
                    f.count
                      ? "border-[var(--line-strong)] bg-[var(--paper-2)] text-[var(--ink)]"
                      : "border-amber-300 bg-amber-50 text-amber-800"
                  }`}
                >
                  {SECTION_LABEL[f.key]}: {f.count || "could not read"}
                </li>
              ))}
            </ul>
          ) : (
            <p className="text-sm text-amber-800">No section headings were recognised.</p>
          )}
          <p className="mt-2 text-xs text-[var(--muted)]">
            You can edit each entry in the Content tab after applying.
          </p>
        </div>

        <div>
          <Field
            label={`Unassigned text (${extra.trim() ? extra.trim().split("\n").length : 0} lines)`}
            multiline
            rows={4}
            value={extra}
            onChange={setExtra}
            hint="Will be added to the Summary. Delete anything you do not need."
          />
        </div>
      </div>

      <div className="sticky bottom-0 flex justify-end gap-2 border-t border-[var(--line-strong)] bg-[var(--card)] px-5 py-3">
        <button type="button" onClick={onCancel} className="ra-btn">
          Cancel
        </button>
        <button type="button" onClick={apply} data-testid="import-apply" className="ra-btn primary">
          Apply and keep editing
        </button>
      </div>
    </div>
  );
}
