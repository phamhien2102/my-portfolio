"use client";

import { useMemo } from "react";

import { TEMPLATES } from "../data";
import { measurerFor, type Family } from "../lib/fonts";
import { layoutResume } from "../lib/layout";
import type { ResumeDoc, TemplateId } from "../types";
import { PageSvg } from "./page-svg";

/** Thumbnails of the CV in each template, drawn from the real layout with the person's data. */
export function TemplatePicker({
  doc,
  family,
  onPick,
}: {
  doc: ResumeDoc;
  family: Family;
  onPick: (id: TemplateId) => void;
}) {
  const thumbs = useMemo(() => {
    const m = measurerFor(family);
    return TEMPLATES.map((t) => ({
      t,
      page: layoutResume({ data: doc.data, settings: { ...doc.settings, template: t.id } }, m)[0],
    }));
  }, [doc.data, doc.settings, family]);

  return (
    <div>
      <p className="mb-3 text-sm text-[var(--muted)]">
        Switching templates keeps your content, colour and font.
      </p>
      <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-2 xl:grid-cols-3">
        {thumbs.map(({ t, page }) => {
          const active = doc.settings.template === t.id;
          return (
            <button
              key={t.id}
              type="button"
              onClick={() => onPick(t.id)}
              aria-pressed={active}
              data-testid={`template-${t.id}`}
              className={`group rounded-[12px] border-2 bg-[var(--card)] p-2 text-left transition ${
                active
                  ? "border-[var(--ink)] bg-[var(--green-tile)] shadow-[var(--pop)]"
                  : "border-[var(--line-strong)] hover:border-[var(--ink)]"
              }`}
            >
              <div className="overflow-hidden rounded-md border border-[var(--line-strong)]">
                <PageSvg
                  page={page}
                  family={family}
                  width="fluid"
                  label={`Preview of the ${t.name} template`}
                  interactive={false}
                />
              </div>
              <div className="mt-2 flex flex-wrap items-center justify-between gap-1 px-1">
                <span className="text-sm font-semibold text-[var(--ink)]">{t.name}</span>
                {active ? (
                  <span className="rounded-full border-[1.5px] border-[var(--ink)] bg-[var(--green)] px-2 py-0.5 text-[10px] font-extrabold text-[var(--ink)]">
                    In use
                  </span>
                ) : null}
              </div>
              <p className="line-clamp-3 px-1 pb-1 text-[11px] leading-snug text-[var(--muted)]">
                {t.blurb}
              </p>
            </button>
          );
        })}
      </div>
    </div>
  );
}
