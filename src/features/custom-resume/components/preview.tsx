"use client";

import { useCallback, useEffect, useState } from "react";

import type { Family } from "../lib/fonts";
import { PAGE_W, type Page } from "../lib/layout";
import { PageSvg } from "./page-svg";

const ZOOMS = [0.5, 0.65, 0.8, 1, 1.25, 1.5, 2];
const GUTTER = 32;

/** Pages of the CV as sheets, with zoom. Zoom is "fit" (to the width) until a step is chosen. */
export function Preview({ pages, family }: { pages: Page[]; family: Family }) {
  const [box, setBox] = useState<HTMLDivElement | null>(null);
  const [avail, setAvail] = useState(0);
  const [zoom, setZoom] = useState<number | "fit">("fit");

  const ref = useCallback((el: HTMLDivElement | null) => setBox(el), []);

  useEffect(() => {
    if (!box) return;
    const ro = new ResizeObserver(() => setAvail(box.clientWidth));
    ro.observe(box);
    return () => ro.disconnect();
  }, [box]);

  const fit = Math.max(0.3, Math.min(1.6, (avail - GUTTER) / PAGE_W));
  const scale = zoom === "fit" ? fit : zoom;
  const width = PAGE_W * scale;

  const step = (dir: 1 | -1) => {
    const cur = scale;
    const next =
      dir > 0
        ? ZOOMS.find((z) => z > cur + 0.01)
        : [...ZOOMS].reverse().find((z) => z < cur - 0.01);
    if (next) setZoom(next);
  };

  return (
    <div className="flex h-full min-h-0 flex-col">
      <div className="flex items-center justify-between gap-3 border-b border-[var(--line-strong)] bg-[var(--card)] px-3 py-2 text-sm text-[var(--muted)]">
        <span aria-live="polite" data-testid="page-count">
          {pages.length} pages · A4
        </span>
        <div className="flex items-center gap-1">
          <button
            type="button"
            onClick={() => step(-1)}
            aria-label="Zoom out"
            className="grid h-8 w-8 place-items-center rounded-[10px] border border-[var(--line-strong)] hover:bg-[var(--tile)]"
          >
            −
          </button>
          <button
            type="button"
            onClick={() => setZoom("fit")}
            className={`h-8 min-w-16 rounded-[10px] border px-2 text-xs font-medium tabular-nums ${
              zoom === "fit"
                ? "border-[var(--ink)] bg-[var(--ink)] text-white"
                : "border-[var(--line-strong)] hover:bg-[var(--tile)]"
            }`}
            title="Fit to width"
          >
            {zoom === "fit" ? "Fit" : `${Math.round(scale * 100)}%`}
          </button>
          <button
            type="button"
            onClick={() => step(1)}
            aria-label="Zoom in"
            className="grid h-8 w-8 place-items-center rounded-[10px] border border-[var(--line-strong)] hover:bg-[var(--tile)]"
          >
            +
          </button>
        </div>
      </div>
      <div ref={ref} className="cv-scroll min-h-0 flex-1 overflow-auto bg-[var(--tile)] py-6">
        <div className="mx-auto flex w-max flex-col gap-6 px-4" data-testid="preview-pages">
          {pages.map((p, i) => (
            <div key={i} className="relative shadow-[0_2px_16px_rgba(15,23,42,0.18)]">
              <PageSvg page={p} family={family} width={width} label={`Page ${i + 1}`} />
              <span className="pointer-events-none absolute right-0 -bottom-5 text-[11px] text-[var(--muted)]">
                {i + 1}/{pages.length}
              </span>
            </div>
          ))}
          <div className="h-2" />
        </div>
      </div>
    </div>
  );
}
