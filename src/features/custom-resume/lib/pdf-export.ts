import fontkit from "@pdf-lib/fontkit";
import {
  AFRelationship,
  PDFDocument,
  PDFFont,
  PDFString,
  rgb,
  appendBezierCurve,
  clip,
  degrees,
  LineCapStyle,
  closePath,
  endPath,
  lineTo,
  moveTo,
  popGraphicsState,
  pushGraphicsState,
  setCharacterSpacing,
  type PDFPage,
} from "pdf-lib";

import type { ResumeDoc } from "../types";
import type { Family, FontStyle } from "./fonts";
import { ICONS, type IconName } from "./icons";
import { hexToRgb } from "./layout/common";
import { PAGE_H, PAGE_W, type Page } from "./layout";
import { shapeSegs } from "./shape";
import type { ImagePrim } from "./layout/types";
import { ATTACHMENT_NAME, toPayload } from "./serialize";

function color(hex: string) {
  const [r, g, b] = hexToRgb(hex);
  return rgb(r / 255, g / 255, b / 255);
}

/**
 * Draw the laid-out pages into a PDF. The text is real text in an embedded font, so it can be
 * selected and copied; the structured CV and the template ride along as a file attachment so the
 * same PDF can be imported again without losing anything.
 */
export async function exportPdf(
  doc: ResumeDoc,
  family: Family,
  pages: Page[],
  measure: (s: string, f: FontStyle, size: number, track?: number) => number,
): Promise<Uint8Array> {
  const pdf = await PDFDocument.create();
  pdf.registerFontkit(fontkit);

  const fonts: Record<FontStyle, PDFFont> = {
    r: await pdf.embedFont(family.faces.r.bytes, { subset: true }),
    b: await pdf.embedFont(family.faces.b.bytes, { subset: true }),
    i: await pdf.embedFont(family.faces.i.bytes, { subset: true }),
  };

  const name = doc.data.basics.name.trim();
  pdf.setTitle(name ? `${name} – CV` : "CV");
  if (name) pdf.setAuthor(name);
  pdf.setSubject(doc.data.basics.title.trim());
  pdf.setKeywords([`custom-resume`, `template:${doc.settings.template}`]);
  pdf.setCreator("Custom Resume");
  pdf.setProducer("Custom Resume (pdf-lib)");

  for (const page of pages) {
    const p = pdf.addPage([PAGE_W, PAGE_H]);
    for (const prim of page.prims) {
      if (prim.k === "rect") {
        p.drawRectangle({
          x: prim.x,
          y: PAGE_H - prim.y - prim.h,
          width: prim.w,
          height: prim.h,
          color: color(prim.fill),
        });
      } else if (prim.k === "line") {
        p.drawLine({
          start: { x: prim.x1, y: PAGE_H - prim.y1 },
          end: { x: prim.x2, y: PAGE_H - prim.y2 },
          thickness: prim.width,
          color: color(prim.color),
        });
      } else if (prim.k === "icon") {
        const d = ICONS[prim.name as IconName];
        if (d) {
          const scale = prim.size / 24;
          p.drawSvgPath(d, {
            x: prim.x,
            y: PAGE_H - prim.y,
            scale,
            borderColor: color(prim.color),
            borderWidth: 1.8,
            borderLineCap: LineCapStyle.Round,
          });
        }
      } else if (prim.k === "image") {
        await drawAvatar(pdf, p, prim);
      } else {
        if (prim.track) p.pushOperators(setCharacterSpacing(prim.track));
        p.drawText(prim.s, {
          x: prim.x,
          y: PAGE_H - prim.y,
          size: prim.size,
          font: fonts[prim.f],
          color: color(prim.color),
          ...(prim.rotate ? { rotate: degrees(prim.rotate) } : {}),
          ...(prim.opacity !== undefined ? { opacity: prim.opacity } : {}),
        });
        if (prim.track) p.pushOperators(setCharacterSpacing(0));
        if (prim.link) {
          const w = measure(prim.s, prim.f, prim.size, prim.track);
          addLink(
            pdf,
            p,
            prim.x,
            PAGE_H - prim.y - prim.size * 0.25,
            w,
            prim.size * 1.05,
            prim.link,
          );
        }
      }
    }
  }

  const json = new TextEncoder().encode(JSON.stringify(toPayload(doc)));
  await pdf.attach(json, ATTACHMENT_NAME, {
    mimeType: "application/json",
    description: "Structured CV data and template, used to import this PDF back into the editor.",
    creationDate: new Date(),
    modificationDate: new Date(),
    afRelationship: AFRelationship.Data,
  });

  return pdf.save();
}

async function drawAvatar(pdf: PDFDocument, page: PDFPage, a: ImagePrim) {
  const m = /^data:image\/(png|jpe?g);base64,(.+)$/.exec(a.src);
  if (!m) return;
  const bytes = Uint8Array.from(atob(m[2]), (ch) => ch.charCodeAt(0));
  const img = m[1] === "png" ? await pdf.embedPng(bytes) : await pdf.embedJpg(bytes);
  const y = PAGE_H - a.y - a.h;
  const segs = shapeSegs(a.shape, a.x, PAGE_H - a.y - a.h, a.w, a.h);
  // shapeSegs works y-down; the PDF is y-up, so mirror inside the box.
  const top = PAGE_H - a.y;
  const flip = (v: number) => 2 * (top - a.h / 2) - v;
  const ops = segs.map((s) =>
    s[0] === "M"
      ? moveTo(s[1], flip(s[2]))
      : s[0] === "L"
        ? lineTo(s[1], flip(s[2]))
        : appendBezierCurve(s[1], flip(s[2]), s[3], flip(s[4]), s[5], flip(s[6])),
  );
  page.pushOperators(pushGraphicsState(), ...ops, closePath(), clip(), endPath());
  page.drawImage(img, { x: a.x, y, width: a.w, height: a.h });
  page.pushOperators(popGraphicsState());
}

function addLink(
  pdf: PDFDocument,
  page: PDFPage,
  x: number,
  y: number,
  w: number,
  h: number,
  url: string,
) {
  const annot = pdf.context.obj({
    Type: "Annot",
    Subtype: "Link",
    Rect: [x, y, x + w, y + h],
    Border: [0, 0, 0],
    A: { Type: "Action", S: "URI", URI: PDFString.of(url) },
  });
  page.node.addAnnot(pdf.context.register(annot));
}

export function downloadName(doc: ResumeDoc): string {
  const base = doc.data.basics.name
    .normalize("NFD")
    .replace(/[̀-ͯ]/g, "")
    .replace(/đ/gi, "d")
    .trim()
    .replace(/[^a-zA-Z0-9]+/g, "-")
    .replace(/^-|-$/g, "");
  return `CV${base ? `-${base}` : ""}.pdf`;
}
