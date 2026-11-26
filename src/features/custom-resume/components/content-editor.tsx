"use client";

import { useState } from "react";

import { SECTION_LABEL } from "../data";
import {
  addRecord,
  addCustomSection,
  addExtra,
  patchExtra,
  removeExtra,
  addSection,
  patchCustom,
  missingSections,
  moveRecord,
  moveSection,
  patchRecord,
  removeRecord,
  removeSection,
  resetTitle,
  setBasic,
  setSummary,
  setTitle,
  toggleHidden,
  type Doc,
} from "../lib/actions";
import {
  customKey,
  isCustomKey,
  type BasicKey,
  type OrderKey,
  type RecordKey,
  type SectionKey,
} from "../types";
import { Field, Icon, IconButton } from "./fields";
import { ADD_LABEL, RECORD_FIELDS, recordLabel } from "./record-fields";
import { ICON_NAMES } from "../lib/icons";
import { AvatarField } from "./avatar-field";
import { SortableList } from "./sortable";

type Update = (fn: (d: Doc) => Doc) => void;

const BASIC_FIELDS: { key: BasicKey; label: string; placeholder?: string; wide?: boolean }[] = [
  { key: "name", label: "Full name", placeholder: "Alex Nguyen", wide: true },
  { key: "title", label: "Job title", placeholder: "Software Engineer", wide: true },
  { key: "email", label: "Email", placeholder: "ban@example.com" },
  { key: "phone", label: "Phone", placeholder: "+84 90 000 0000" },
  { key: "location", label: "Location", placeholder: "City, Country", wide: true },
  { key: "website", label: "Website", placeholder: "yourname.dev" },
  { key: "linkedin", label: "LinkedIn", placeholder: "linkedin.com/in/you" },
  { key: "github", label: "GitHub", placeholder: "github.com/you" },
];

export function ContentEditor({ doc, update }: { doc: Doc; update: Update }) {
  const [open, setOpen] = useState<Set<string>>(() => new Set(["experience"]));
  const toggle = (id: string, force?: boolean) =>
    setOpen((prev) => {
      const next = new Set(prev);
      const want = force ?? !next.has(id);
      if (want) next.add(id);
      else next.delete(id);
      return next;
    });

  const sections = doc.settings.order.map((k) => ({ id: k as string, key: k }));
  const missing = missingSections(doc);

  return (
    <div className="space-y-4">
      <Card>
        <h3 className="mb-3 text-sm font-semibold text-[var(--ink)]">Personal details</h3>
        <AvatarField doc={doc} update={update} />
        <div className="grid grid-cols-2 gap-3">
          {BASIC_FIELDS.map((f) => (
            <Field
              key={f.key}
              label={f.label}
              placeholder={f.placeholder}
              value={doc.data.basics[f.key]}
              onChange={(v) => update((d) => setBasic(d, f.key, v))}
              className={f.wide ? "col-span-2" : ""}
            />
          ))}
        </div>
        <ExtraDetails doc={doc} update={update} />
      </Card>

      <div>
        <div className="mb-2 flex items-end justify-between">
          <h3 className="text-sm font-semibold text-[var(--ink)]">Sections in your CV</h3>
          <p className="text-[11px] text-[var(--muted)]">Drag to reorder</p>
        </div>
        <SortableList
          items={sections}
          label="section"
          onMove={(from, to) => update((d) => moveSection(d, from, to))}
          render={({ key }, handle) => {
            const isOpen = open.has(key);
            const hidden = doc.settings.hidden.includes(key);
            return (
              <div
                className={`rounded-[12px] border-[1.5px] bg-[var(--card)] shadow-[var(--pop)] ${hidden ? "border-dashed border-[var(--line-strong)] shadow-none" : "border-[var(--ink)]"}`}
              >
                <div className="flex items-center gap-1 px-2 py-1.5">
                  {handle}
                  <button
                    type="button"
                    onClick={() => toggle(key)}
                    aria-expanded={isOpen}
                    className="flex min-w-0 flex-1 items-center gap-2 rounded-[10px] px-1 py-1.5 text-left"
                  >
                    <span
                      className={`text-[var(--muted)] transition ${isOpen ? "rotate-0" : "-rotate-90"}`}
                    >
                      {Icon.chevron}
                    </span>
                    <span
                      className={`truncate text-sm font-medium ${hidden ? "text-[var(--muted)]" : "text-[var(--ink)]"}`}
                    >
                      {labelOf(doc, key)}
                    </span>
                    {hidden ? (
                      <span className="rounded bg-[var(--tile)] px-1.5 py-0.5 text-[10px] text-[var(--muted)]">
                        hidden
                      </span>
                    ) : (
                      <span className="text-xs text-[var(--muted)]">{countLabel(doc, key)}</span>
                    )}
                  </button>
                  <IconButton
                    label={hidden ? "Show this section" : "Hide this section"}
                    onClick={() => update((d) => toggleHidden(d, key))}
                  >
                    {hidden ? Icon.eyeOff : Icon.eye}
                  </IconButton>
                  <IconButton
                    label="Remove this section from the CV"
                    danger
                    onClick={() => update((d) => removeSection(d, key))}
                  >
                    {Icon.trash}
                  </IconButton>
                </div>
                {isOpen ? (
                  <div className="space-y-3 border-t border-[var(--line)] p-3">
                    {isCustomKey(key) ? (
                      <CustomEditor doc={doc} update={update} k={key} />
                    ) : (
                      <TitleField doc={doc} update={update} k={key as SectionKey} />
                    )}
                    {isCustomKey(key) ? null : key === "summary" ? (
                      <Field
                        label="Content"
                        multiline
                        rows={5}
                        value={doc.data.summary}
                        onChange={(v) => update((d) => setSummary(d, v))}
                        placeholder="2–4 sentences about you, your strengths and what you are looking for."
                      />
                    ) : (
                      <Records
                        k={key as SectionKey}
                        doc={doc}
                        update={update}
                        open={open}
                        toggle={toggle}
                      />
                    )}
                  </div>
                ) : null}
              </div>
            );
          }}
        />
        {
          <div className="mt-3 rounded-[12px] border border-dashed border-[var(--line-strong)] p-3">
            <p className="mb-2 text-xs font-medium text-[var(--muted)]">Add section</p>
            <div className="flex flex-wrap gap-2">
              <button
                type="button"
                data-testid="add-custom-section"
                onClick={() => {
                  const { doc: next, key } = addCustomSection(doc);
                  update(() => next);
                  toggle(key, true);
                }}
                className="inline-flex items-center gap-1 rounded-full border-[1.5px] border-[var(--ink)] bg-[var(--green)] px-3 py-1.5 text-xs font-extrabold text-[var(--ink)] shadow-[var(--pop)]"
              >
                {Icon.plus} Custom section
              </button>
              {missing.map((k) => (
                <button
                  key={k}
                  type="button"
                  onClick={() => {
                    update((d) => addSection(d, k));
                    toggle(k, true);
                  }}
                  className="inline-flex items-center gap-1 rounded-full border border-[var(--line-strong)] bg-[var(--card)] px-3 py-1.5 text-xs font-medium text-[var(--ink)] hover:border-[var(--ink)]"
                >
                  {Icon.plus} {SECTION_LABEL[k]}
                </button>
              ))}
            </div>
          </div>
        }
      </div>
    </div>
  );
}

function labelOf(doc: Doc, key: OrderKey): string {
  if (!isCustomKey(key)) return SECTION_LABEL[key];
  return doc.data.custom.find((c) => customKey(c.id) === key)?.title.trim() || "Custom section";
}

function CustomEditor({ doc, update, k }: { doc: Doc; update: Update; k: OrderKey }) {
  const cs = doc.data.custom.find((c) => customKey(c.id) === k);
  if (!cs) return null;
  return (
    <div className="space-y-3">
      <Field
        label="Section title"
        value={cs.title}
        placeholder="Interests, Awards, Volunteering…"
        onChange={(v) => update((d) => patchCustom(d, k, { title: v }))}
      />
      <div>
        <span className="mb-1 block text-xs font-medium text-[var(--muted)]">Layout</span>
        <div className="inline-flex rounded-[10px] border border-[var(--line-strong)] p-0.5">
          {(
            [
              ["bullets", "Bullet list"],
              ["text", "Paragraphs"],
            ] as const
          ).map(([id, label]) => (
            <button
              key={id}
              type="button"
              aria-pressed={cs.style === id}
              onClick={() => update((d) => patchCustom(d, k, { style: id }))}
              className={`rounded-md px-3 py-1.5 text-xs font-medium ${
                cs.style === id
                  ? "bg-[var(--ink)] text-white"
                  : "text-[var(--muted)] hover:text-[var(--ink)]"
              }`}
            >
              {label}
            </button>
          ))}
        </div>
      </div>
      <Field
        label="Content"
        multiline
        rows={5}
        value={cs.body}
        placeholder={cs.style === "bullets" ? "One item per line" : "Write a few sentences"}
        hint={
          cs.style === "bullets"
            ? "Each line becomes a bullet."
            : "A new line starts a new paragraph."
        }
        onChange={(v) => update((d) => patchCustom(d, k, { body: v }))}
      />
    </div>
  );
}

function countLabel(doc: Doc, key: OrderKey): string {
  if (isCustomKey(key)) {
    return doc.data.custom.find((c) => customKey(c.id) === key)?.body.trim() ? "" : "empty";
  }
  if (key === "summary") return doc.data.summary.trim() ? "" : "empty";
  const n = doc.data[key as RecordKey].length;
  return n ? `${n}` : "empty";
}

function Card({ children }: { children: React.ReactNode }) {
  return (
    <section className="rounded-[12px] border-[1.5px] border-[var(--ink)] bg-[var(--card)] p-4 shadow-[var(--pop)]">
      {children}
    </section>
  );
}

function TitleField({ doc, update, k }: { doc: Doc; update: Update; k: SectionKey }) {
  return (
    <div className="flex items-end gap-2">
      <Field
        label="Heading shown on the CV"
        value={doc.settings.titles[k]}
        onChange={(v) => update((d) => setTitle(d, k, v))}
        className="flex-1"
      />
      <button
        type="button"
        onClick={() => update((d) => resetTitle(d, k))}
        className="mb-px h-[38px] rounded-[10px] border border-[var(--line-strong)] px-2.5 text-xs text-[var(--muted)] hover:bg-[var(--tile)]"
      >
        Default
      </button>
    </div>
  );
}

function Records({
  k,
  doc,
  update,
  open,
  toggle,
}: {
  k: SectionKey;
  doc: Doc;
  update: Update;
  open: Set<string>;
  toggle: (id: string, force?: boolean) => void;
}) {
  const key = k as RecordKey;
  const list = doc.data[key] as unknown as ({ id: string } & Record<string, string>)[];
  return (
    <div className="space-y-2">
      <SortableList
        items={list}
        label="entry"
        onMove={(from, to) => update((d) => moveRecord(d, key, from, to))}
        render={(rec, handle) => {
          const isOpen = open.has(rec.id);
          const [a, b] = recordLabel(key, rec);
          return (
            <div className="rounded-[10px] border border-[var(--line-strong)] bg-[var(--paper-2)]">
              <div className="flex items-center gap-1 px-1.5 py-1">
                {handle}
                <button
                  type="button"
                  onClick={() => toggle(rec.id)}
                  aria-expanded={isOpen}
                  className="flex min-w-0 flex-1 items-baseline gap-2 rounded px-1 py-1.5 text-left"
                >
                  <span className="truncate text-sm font-medium text-[var(--ink)]">{a}</span>
                  {b ? <span className="truncate text-xs text-[var(--muted)]">{b}</span> : null}
                </button>
                <IconButton
                  label="Delete entry"
                  danger
                  onClick={() => update((d) => removeRecord(d, key, rec.id))}
                >
                  {Icon.trash}
                </IconButton>
              </div>
              {isOpen ? (
                <div className="grid grid-cols-2 gap-3 border-t border-[var(--line-strong)] bg-[var(--card)] p-3">
                  {RECORD_FIELDS[key].map((f) => (
                    <Field
                      key={f.name}
                      label={f.label}
                      placeholder={f.placeholder}
                      hint={f.hint}
                      multiline={f.multiline}
                      rows={f.name === "items" ? 2 : 4}
                      value={rec[f.name] ?? ""}
                      onChange={(v) => update((d) => patchRecord(d, key, rec.id, { [f.name]: v }))}
                      className={f.wide ? "col-span-2" : ""}
                    />
                  ))}
                </div>
              ) : null}
            </div>
          );
        }}
      />
      <button
        type="button"
        onClick={() => {
          const { doc: next, id } = addRecord(doc, key);
          update(() => next);
          toggle(id, true);
        }}
        className="inline-flex w-full items-center justify-center gap-1.5 rounded-[10px] border border-dashed border-[var(--line-strong)] py-2 text-sm font-medium text-[var(--muted)] hover:border-[var(--ink)] hover:text-[var(--ink)]"
      >
        {Icon.plus} {ADD_LABEL[key]}
      </button>
    </div>
  );
}

const EXTRA_SUGGESTIONS = [
  "Date of birth",
  "Nationality",
  "Gender",
  "Marital status",
  "Portfolio",
  "Twitter / X",
  "Driving licence",
];

/** Extra personal details: anything that is not email, phone, address or links. */
function ExtraDetails({ doc, update }: { doc: Doc; update: Update }) {
  const extras = doc.data.basics.extras;
  const unused = EXTRA_SUGGESTIONS.filter(
    (s) => !extras.some((x) => x.label.trim().toLowerCase() === s.toLowerCase()),
  );
  return (
    <div className="mt-4 border-t border-[var(--line)] pt-3" data-testid="extras">
      <h4 className="mb-2 text-xs font-extrabold tracking-wider text-[var(--muted)] uppercase">
        More details
      </h4>
      {extras.length ? (
        <ul className="mb-3 space-y-2">
          {extras.map((x) => (
            <li key={x.id} className="grid grid-cols-[1fr_1.3fr_auto_auto] items-end gap-2">
              <Field
                label="Label"
                value={x.label}
                placeholder="Nationality"
                onChange={(v) => update((d) => patchExtra(d, x.id, { label: v }))}
              />
              <Field
                label="Value"
                value={x.value}
                placeholder="Vietnamese"
                onChange={(v) => update((d) => patchExtra(d, x.id, { value: v }))}
              />
              <label className="block">
                <span className="mb-1 block text-xs font-medium text-[var(--muted)]">Icon</span>
                <select
                  value={x.icon}
                  aria-label={`Icon for ${x.label || "detail"}`}
                  onChange={(e) => update((d) => patchExtra(d, x.id, { icon: e.target.value }))}
                  className="h-[38px] w-[88px] rounded-[10px] border border-[var(--line-strong)] bg-[var(--card)] px-1.5 text-xs text-[var(--ink)] focus:border-[var(--ink)] focus:outline-none"
                >
                  <option value="">Auto</option>
                  <option value="none">None</option>
                  {ICON_NAMES.map((n) => (
                    <option key={n} value={n}>
                      {n}
                    </option>
                  ))}
                </select>
              </label>
              <IconButton
                label="Remove detail"
                danger
                onClick={() => update((d) => removeExtra(d, x.id))}
              >
                {Icon.trash}
              </IconButton>
            </li>
          ))}
        </ul>
      ) : null}
      <div className="flex flex-wrap gap-2">
        <button
          type="button"
          data-testid="add-extra"
          onClick={() => update((d) => addExtra(d).doc)}
          className="inline-flex items-center gap-1 rounded-full border-[1.5px] border-[var(--ink)] bg-[var(--green)] px-3 py-1.5 text-xs font-extrabold text-[var(--ink)] shadow-[var(--pop)]"
        >
          {Icon.plus} Add detail
        </button>
        {unused.slice(0, 5).map((s) => (
          <button
            key={s}
            type="button"
            onClick={() => update((d) => addExtra(d, s).doc)}
            className="rounded-full border border-[var(--line-strong)] bg-[var(--card)] px-3 py-1.5 text-xs text-[var(--ink)] hover:border-[var(--ink)]"
          >
            + {s}
          </button>
        ))}
      </div>
    </div>
  );
}
