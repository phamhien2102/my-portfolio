import type { Measurer } from "../fonts";
import type { ResumeDoc } from "../../types";
import { PAGE_H, PAGE_W } from "./types";
import { layoutClassic } from "./classic";
import { layoutCompact } from "./compact";
import { layoutCreative } from "./creative";
import { layoutMinimal } from "./minimal";
import { makeCtx } from "./common";
import { layoutExecutive } from "./executive";
import { layoutModern } from "./modern";
import type { Page } from "./types";

export { PAGE_H, PAGE_W } from "./types";
export type { Page, Prim } from "./types";

/** Lay the CV out into A4 pages. Pure: the same input always gives the same pages. */
export function layoutResume(doc: ResumeDoc, m: Measurer): Page[] {
  const c = makeCtx(m, doc.data, doc.settings);
  const layouts = {
    classic: layoutClassic,
    modern: layoutModern,
    executive: layoutExecutive,
    compact: layoutCompact,
    creative: layoutCreative,
    minimal: layoutMinimal,
  };
  const pages = layouts[doc.settings.template](c);
  const out = pages.length ? pages : [{ prims: [] }];
  addWatermark(out, doc, m);
  addPageNumbers(out, doc, m);
  return out;
}

/** "1 / 3" in the bottom margin, aligned to the content (the sidebar template keeps to its main column). */
function addPageNumbers(pages: Page[], doc: ResumeDoc, m: Measurer) {
  const pos = doc.settings.pageNumbers;
  if (pos === "off") return;
  const left = doc.settings.template === "modern" ? 224 : 44;
  const right = doc.settings.template === "modern" ? PAGE_W - 36 : PAGE_W - 44;
  const size = 8;
  pages.forEach((page, i) => {
    const s = `${i + 1} / ${pages.length}`;
    const w = m.width(s, "r", size);
    const x = pos === "left" ? left : pos === "right" ? right - w : (left + right - w) / 2;
    page.prims.push({ k: "text", x, y: PAGE_H - 20, s, f: "r", size, color: "#7a7a7a" });
  });
}

/**
 * Faint text behind the CV. It goes after the full-bleed backgrounds (the Modern sidebar) but
 * before everything else, so it sits behind the words.
 */
function addWatermark(pages: Page[], doc: ResumeDoc, m: Measurer) {
  const wm = doc.settings.watermark;
  const text = wm.text.trim();
  if (!text) return;
  const diagonal = wm.mode === "diagonal";
  const unit = m.width(text, "b", 1);
  const target = diagonal ? 640 : 470;
  // Fit the text to the page first, then let the person scale it (the cap would otherwise hide the slider).
  const fitted = Math.min(150, target / unit);
  const size = Math.max(8, fitted * wm.scale);
  const w = unit * size;
  const theta = diagonal ? 45 : 0;
  const rad = (theta * Math.PI) / 180;
  const cx = PAGE_W / 2;
  const cy = PAGE_H / 2;
  const x = cx - (w / 2) * Math.cos(rad) + 0.35 * size * Math.sin(rad);
  const y = cy + (w / 2) * Math.sin(rad) + 0.35 * size * Math.cos(rad);
  for (const page of pages) {
    let at = 0;
    while (at < page.prims.length && page.prims[at].k === "rect") at++;
    page.prims.splice(at, 0, {
      k: "text",
      x,
      y,
      s: text,
      f: "b",
      size,
      color: "#000000",
      opacity: wm.opacity,
      ...(theta ? { rotate: theta } : {}),
    });
  }
}
