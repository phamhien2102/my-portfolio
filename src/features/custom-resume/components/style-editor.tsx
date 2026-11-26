"use client";

import { useState } from "react";

import { ACCENTS, FONTS, TITLES_EN, TITLES_VI } from "../data";
import { setSettings, type Doc } from "../lib/actions";
import { cssRadius } from "../lib/shape";
import { Icon } from "./fields";
import type { FontId } from "../types";

type Update = (fn: (d: Doc) => Doc) => void;

function Slider({
  label,
  value,
  min,
  max,
  step,
  format,
  onChange,
}: {
  label: string;
  value: number;
  min: number;
  max: number;
  step: number;
  format: (v: number) => string;
  onChange: (v: number) => void;
}) {
  return (
    <label className="block">
      <span className="mb-1 flex items-center justify-between text-xs font-medium text-[var(--muted)]">
        {label}
        <span className="text-[var(--ink)] tabular-nums">{format(value)}</span>
      </span>
      <input
        type="range"
        min={min}
        max={max}
        step={step}
        value={value}
        onChange={(e) => onChange(Number(e.target.value))}
        className="w-full accent-[var(--ink)]"
      />
    </label>
  );
}

/** A design group that can be folded away, so a long panel stays easy to scan. */
function Section({ title, children }: { title: string; children: React.ReactNode }) {
  const [open, setOpen] = useState(true);
  return (
    <section className="rounded-[12px] border border-[var(--line-strong)] bg-[var(--card)]">
      <button
        type="button"
        onClick={() => setOpen((o) => !o)}
        aria-expanded={open}
        className="flex w-full items-center justify-between gap-2 px-3 py-2.5 text-left"
      >
        <h3 className="text-sm font-semibold text-[var(--ink)]">{title}</h3>
        <span className={`text-[var(--muted)] transition ${open ? "rotate-0" : "-rotate-90"}`}>
          {Icon.chevron}
        </span>
      </button>
      {open ? <div className="border-t border-[var(--line)] px-3 pt-3 pb-3">{children}</div> : null}
    </section>
  );
}

export function StyleEditor({ doc, update }: { doc: Doc; update: Update }) {
  const s = doc.settings;
  const set = (patch: Parameters<typeof setSettings>[1]) => update((d) => setSettings(d, patch));
  const isVi = s.titles.experience === TITLES_VI.experience;
  return (
    <div className="space-y-6">
      <Section title="Accent colour">
        <div className="flex flex-wrap items-center gap-2">
          {ACCENTS.map((c) => (
            <button
              key={c}
              type="button"
              onClick={() => set({ accent: c })}
              aria-label={`Colour ${c}`}
              aria-pressed={s.accent.toLowerCase() === c}
              className={`h-8 w-8 rounded-full border-2 transition ${
                s.accent.toLowerCase() === c
                  ? "border-[var(--ink)] ring-2 ring-white ring-inset"
                  : "border-transparent"
              }`}
              style={{ background: c }}
            />
          ))}
          <label className="ml-1 flex items-center gap-2 text-xs text-[var(--muted)]">
            <input
              type="color"
              value={s.accent}
              onChange={(e) => set({ accent: e.target.value })}
              aria-label="Pick any colour"
              className="h-8 w-10 cursor-pointer rounded border border-[var(--line-strong)] bg-[var(--card)] p-0.5"
            />
            Custom
          </label>
        </div>
      </Section>

      <Section title="Watermark">
        <input
          type="text"
          value={s.watermark.text}
          maxLength={60}
          placeholder="Text behind the CV, e.g. CONFIDENTIAL"
          aria-label="Watermark text"
          data-testid="watermark-text"
          onChange={(e) => set({ watermark: { ...s.watermark, text: e.target.value } })}
          className="w-full rounded-[10px] border border-[var(--line-strong)] bg-[var(--card)] px-3 py-2 text-sm text-[var(--ink)] placeholder:text-[var(--muted)] focus:border-[var(--ink)] focus:ring-2 focus:ring-[var(--green-2)] focus:outline-none"
        />
        <div
          className={`mt-3 space-y-3 ${s.watermark.text.trim() ? "" : "pointer-events-none opacity-50"}`}
        >
          <div className="inline-flex rounded-[10px] border border-[var(--line-strong)] p-0.5">
            {(
              [
                ["diagonal", "Diagonal"],
                ["horizontal", "Horizontal"],
              ] as const
            ).map(([id, label]) => (
              <button
                key={id}
                type="button"
                aria-pressed={s.watermark.mode === id}
                onClick={() => set({ watermark: { ...s.watermark, mode: id } })}
                className={`rounded-md px-3 py-1.5 text-xs font-medium ${
                  s.watermark.mode === id
                    ? "bg-[var(--ink)] text-white"
                    : "text-[var(--muted)] hover:text-[var(--ink)]"
                }`}
              >
                {label}
              </button>
            ))}
          </div>
          <Slider
            label="Opacity"
            value={s.watermark.opacity}
            min={0.03}
            max={0.3}
            step={0.01}
            format={(v) => `${Math.round(v * 100)}%`}
            onChange={(v) => set({ watermark: { ...s.watermark, opacity: v } })}
          />
          <Slider
            label="Size"
            value={s.watermark.scale}
            min={0.5}
            max={1.5}
            step={0.05}
            format={(v) => `${Math.round(v * 100)}%`}
            onChange={(v) => set({ watermark: { ...s.watermark, scale: v } })}
          />
        </div>
        <p className="mt-2 text-xs text-[var(--muted)]">
          Faint text behind the content, in the preview and the PDF (not in the Word file). Leave
          empty for none.
        </p>
      </Section>

      <Section title="Icons">
        <label className="flex cursor-pointer items-center gap-3">
          <input
            type="checkbox"
            checked={s.contactIcons}
            data-testid="contact-icons"
            onChange={(e) => set({ contactIcons: e.target.checked })}
            className="h-4 w-4 accent-[var(--ink)]"
          />
          <span className="text-sm text-[var(--ink)]">Show icons before contact details</span>
        </label>
        <p className="mt-2 text-xs text-[var(--muted)]">
          Email, phone, address and links get a small line icon. Details you add under Personal
          details can pick their own icon. Icons appear in the preview and the PDF (not the Word
          file), and some applicant tracking systems read plain text better.
        </p>
      </Section>

      <Section title="Page numbers">
        <div className="inline-flex rounded-[10px] border border-[var(--line-strong)] p-0.5">
          {(
            [
              ["off", "Off"],
              ["left", "Left"],
              ["center", "Centre"],
              ["right", "Right"],
            ] as const
          ).map(([id, label]) => (
            <button
              key={id}
              type="button"
              aria-pressed={s.pageNumbers === id}
              onClick={() => set({ pageNumbers: id })}
              className={`rounded-md px-3 py-1.5 text-xs font-medium ${
                s.pageNumbers === id
                  ? "bg-[var(--ink)] text-white"
                  : "text-[var(--muted)] hover:text-[var(--ink)]"
              }`}
            >
              {label}
            </button>
          ))}
        </div>
      </Section>

      <Section title="Profile photo">
        <div className="flex flex-wrap gap-2">
          {(
            [
              ["circle", "Circle"],
              ["square", "Square"],
              ["rounded", "Rounded"],
              ["arch", "Arch"],
              ["leaf", "Leaf"],
            ] as const
          ).map(([id, label]) => (
            <button
              key={id}
              type="button"
              aria-pressed={s.avatarShape === id}
              onClick={() => set({ avatarShape: id })}
              className={`flex w-[72px] flex-col items-center gap-1.5 rounded-[10px] border px-2 py-2 text-xs font-medium ${
                s.avatarShape === id
                  ? "border-[var(--ink)] bg-[var(--green-tile)] text-[var(--ink)]"
                  : "border-[var(--line-strong)] text-[var(--muted)] hover:border-[var(--ink)]"
              }`}
            >
              <span
                className="block h-7 w-7 bg-[var(--edge)]"
                style={{ borderRadius: cssRadius(id) }}
              />
              {label}
            </button>
          ))}
        </div>
        <div className="mt-3">
          <Slider
            label="Photo size"
            value={s.avatarScale}
            min={0.6}
            max={1.6}
            step={0.05}
            format={(v) => `${Math.round(v * 100)}%`}
            onChange={(v) => set({ avatarScale: v })}
          />
        </div>
        <p className="mt-2 text-xs text-[var(--muted)]">
          Upload a photo in the Content tab under Personal details. With no photo, the CV shows
          none.
        </p>
      </Section>

      <Section title="Font">
        <div className="grid grid-cols-2 gap-2">
          {FONTS.map((f) => (
            <button
              key={f.id}
              type="button"
              onClick={() => set({ font: f.id as FontId })}
              aria-pressed={s.font === f.id}
              className={`rounded-[10px] border px-3 py-2 text-left transition ${
                s.font === f.id
                  ? "border-[var(--ink)] bg-[var(--green-tile)]"
                  : "border-[var(--line-strong)] bg-[var(--card)] hover:border-[var(--ink)]"
              }`}
            >
              <span className="block text-sm font-medium text-[var(--ink)]">{f.name}</span>
              <span className="block text-xs text-[var(--muted)]">{f.blurb}</span>
            </button>
          ))}
        </div>
      </Section>

      <Section title="Text size and spacing">
        <div className="space-y-4">
          <Slider
            label="Body text size"
            value={s.fontSize}
            min={8}
            max={12}
            step={0.5}
            format={(v) => `${v} pt`}
            onChange={(v) => set({ fontSize: v })}
          />
          <Slider
            label="Line and section spacing"
            value={s.spacing}
            min={0.7}
            max={1.5}
            step={0.05}
            format={(v) => `${Math.round(v * 100)}%`}
            onChange={(v) => set({ spacing: v })}
          />
        </div>
      </Section>

      <Section title="Section heading language">
        <div className="inline-flex rounded-[10px] border border-[var(--line-strong)] p-0.5">
          {[
            { id: "en", label: "English", titles: TITLES_EN },
            { id: "vi", label: "Tiếng Việt", titles: TITLES_VI },
          ].map((o) => {
            const active = (o.id === "vi") === isVi;
            return (
              <button
                key={o.id}
                type="button"
                aria-pressed={active}
                onClick={() => set({ titles: o.titles })}
                className={`rounded-md px-3 py-1.5 text-xs font-medium ${
                  active
                    ? "bg-[var(--ink)] text-white"
                    : "text-[var(--muted)] hover:text-[var(--ink)]"
                }`}
              >
                {o.label}
              </button>
            );
          })}
        </div>
        <p className="mt-2 text-xs text-[var(--muted)]">
          Each heading can be edited on its own in the Content tab.
        </p>
      </Section>
    </div>
  );
}
