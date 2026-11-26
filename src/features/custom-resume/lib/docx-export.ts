import {
  customKey,
  isCustomKey,
  type FontId,
  type OrderKey,
  type ResumeDoc,
  type SectionKey,
} from "../types";
import { contactItems, dates, linesOf, mix, readableOn } from "./layout/common";

/**
 * A Word (.docx) copy of the CV. Word has no absolute positioning, so this is an editable
 * approximation of the chosen template (single column, or a sidebar table for Modern and Creative),
 * set in fonts that ship with Word. The PDF remains the exact, re-importable export.
 */

const WORD_FONT: Record<FontId, string> = {
  sans: "Calibri",
  serif: "Georgia",
  times: "Times New Roman",
  mono: "Courier New",
};

const A4_W = 11906;
const A4_H = 16838;
const SIDEBAR_TEMPLATES = ["modern", "creative"];
const NARROW: SectionKey[] = ["skills", "languages", "certifications"];

const hex = (c: string) => c.replace("#", "").toUpperCase();
const twip = (pt: number) => Math.round(pt * 20);

export async function exportDocx(doc: ResumeDoc): Promise<Blob> {
  const D = await import("docx");
  const { data: d, settings: s } = doc;
  const font = WORD_FONT[s.font];
  const accent = hex(s.accent);
  const ink = "1A1A1A";
  const muted = "585858";
  const body = Math.round(s.fontSize * 2); // half-points
  const sp = s.spacing;
  const tpl = s.template;
  const sidebar = SIDEBAR_TEMPLATES.includes(tpl);
  const margin =
    tpl === "executive" ? 1000 : tpl === "compact" ? 720 : tpl === "minimal" ? 1000 : 860;
  const contentW = A4_W - margin * 2;
  const vi = s.titles.contact === "Liên hệ";

  type Child = import("docx").Paragraph | import("docx").Table;
  const none = { style: D.BorderStyle.NONE, size: 0, color: "FFFFFF" };
  const noBorders = {
    top: none,
    bottom: none,
    left: none,
    right: none,
    insideHorizontal: none,
    insideVertical: none,
  };

  interface RunOpts {
    bold?: boolean;
    italics?: boolean;
    color?: string;
    size?: number;
    caps?: boolean;
    spacing?: number;
    link?: string;
  }
  const run = (text: string, o: RunOpts = {}) => {
    // docx writes a literal "\t" as text, so tabs have to be real Tab elements.
    const parts = text.split("\t");
    const kids: (string | InstanceType<typeof D.Tab>)[] = [];
    parts.forEach((p, i) => {
      if (i) kids.push(new D.Tab());
      if (p) kids.push(p);
    });
    const r = new D.TextRun({
      children: kids,
      font,
      bold: o.bold,
      italics: o.italics,
      color: o.color ?? ink,
      size: o.size ?? body,
      allCaps: o.caps,
      characterSpacing: o.spacing,
    });
    if (!o.link) return r;
    return new D.ExternalHyperlink({
      link: o.link,
      children: [
        new D.TextRun({
          text,
          font,
          color: o.color ?? ink,
          size: o.size ?? body,
          bold: o.bold,
        }),
      ],
    });
  };

  interface ParaOpts {
    before?: number;
    after?: number;
    align?: "left" | "center" | "right";
    tabRight?: number;
    bottomRule?: { color: string; size: number };
    keepNext?: boolean;
    hanging?: boolean;
    shade?: string;
  }
  const para = (
    children: (
      import("docx").TextRun | import("docx").ExternalHyperlink | import("docx").ImageRun
    )[],
    o: ParaOpts = {},
  ) =>
    new D.Paragraph({
      children,
      alignment:
        o.align === "center"
          ? D.AlignmentType.CENTER
          : o.align === "right"
            ? D.AlignmentType.RIGHT
            : D.AlignmentType.LEFT,
      spacing: { before: twip((o.before ?? 0) * sp), after: twip((o.after ?? 0) * sp), line: 264 },
      tabStops: o.tabRight
        ? [{ type: D.TabStopType.RIGHT, position: o.tabRight }]
        : o.hanging
          ? [{ type: D.TabStopType.LEFT, position: 260 }]
          : undefined,
      border: o.bottomRule
        ? {
            bottom: {
              style: D.BorderStyle.SINGLE,
              size: o.bottomRule.size,
              color: o.bottomRule.color,
              space: 2,
            },
          }
        : undefined,
      keepNext: o.keepNext,
      indent: o.hanging ? { left: 260, hanging: 260 } : undefined,
      shading: o.shade ? { type: D.ShadingType.CLEAR, fill: o.shade, color: "auto" } : undefined,
    });

  /* ---------- palette per column ---------- */
  interface Pal {
    ink: string;
    muted: string;
    accent: string;
    width: number;
    narrow: boolean;
  }
  const mainPal: Pal = { ink, muted, accent, width: contentW, narrow: false };
  const sideOn = hex(readableOn(s.accent));
  const sideSoft = hex(mix(readableOn(s.accent), s.accent, 0.28));

  /* ---------- headings ---------- */
  const heading = (text: string, pal: Pal, onSidebar: boolean): Child => {
    if (onSidebar && tpl === "modern") {
      return para(
        [run(text, { bold: true, caps: true, color: pal.ink, size: body - 2, spacing: 30 })],
        {
          before: 14,
          after: 5,
          bottomRule: { color: sideSoft, size: 4 },
          keepNext: true,
        },
      );
    }
    switch (tpl) {
      case "modern":
        return para([run(text, { bold: true, color: accent, size: body + 5 })], {
          before: 13,
          after: 4,
          keepNext: true,
        });
      case "compact":
        return para(
          [run(text, { bold: true, caps: true, color: accent, size: body, spacing: 20 })],
          {
            before: 9,
            after: 3,
            bottomRule: { color: hex(mix(s.accent, "#ffffff", 0.7)), size: 4 },
            keepNext: true,
          },
        );
      case "creative":
        return para(
          [
            run(text, {
              bold: true,
              caps: onSidebar,
              color: accent,
              size: onSidebar ? body - 1 : body + 4,
              spacing: onSidebar ? 20 : 0,
            }),
          ],
          {
            before: 13,
            after: 4,
            bottomRule: onSidebar
              ? undefined
              : { color: hex(mix(s.accent, "#ffffff", 0.65)), size: 6 },
            keepNext: true,
          },
        );
      case "executive":
        return para(
          [run(text, { bold: true, caps: true, color: accent, size: body - 1, spacing: 40 })],
          {
            before: 15,
            after: 4,
            bottomRule: { color: accent, size: 4 },
            keepNext: true,
          },
        );
      case "minimal":
        return para(
          [run(text, { bold: true, caps: true, color: accent, size: body - 2, spacing: 40 })],
          {
            before: 16,
            after: 4,
            keepNext: true,
          },
        );
      default:
        return para(
          [run(text, { bold: true, caps: true, color: accent, size: body + 1, spacing: 14 })],
          {
            before: 12,
            after: 4,
            bottomRule: { color: accent, size: 6 },
            keepNext: true,
          },
        );
    }
  };

  /* ---------- entries ---------- */
  const bullet = (t: string, pal: Pal) =>
    para(
      [
        run(tpl === "executive" || tpl === "minimal" ? "–\t" : "•\t", {
          color: pal.narrow ? pal.ink : accent,
        }),
        run(t, { color: pal.ink }),
      ],
      { after: 1.5, hanging: true, tabRight: undefined },
    );

  const titleLine = (left: string, right: string, pal: Pal, rightLink?: string) =>
    para(
      [
        run(left, { bold: true, color: pal.ink, size: body + 1 }),
        ...(right
          ? [
              run("\t", {}),
              run(right, {
                color: rightLink ? pal.accent : pal.muted,
                size: body - 1,
                link: rightLink,
              }),
            ]
          : []),
      ],
      { before: 6, tabRight: pal.width, keepNext: true },
    );

  const sub = (
    parts: { t: string; bold?: boolean; italics?: boolean; color?: string }[],
    pal: Pal,
  ) =>
    para(
      parts.map((p) => run(p.t, { bold: p.bold, italics: p.italics, color: p.color ?? pal.muted })),
      {
        after: 2,
        keepNext: true,
      },
    );

  const url = (v: string) =>
    /^[a-z][a-z0-9+.-]*:/i.test(v.trim()) ? v.trim() : `https://${v.trim()}`;

  const section = (key: OrderKey, pal: Pal, onSidebar: boolean): Child[] => {
    const out: Child[] = [];
    if (isCustomKey(key)) {
      const cs = d.custom.find((c) => customKey(c.id) === key);
      if (!cs || !cs.body.trim()) return [];
      out.push(heading(cs.title.trim() || "Section", pal, onSidebar));
      if (cs.style === "bullets") linesOf(cs.body).forEach((b) => out.push(bullet(b, pal)));
      else
        cs.body
          .split(/\n+/)
          .filter((p) => p.trim())
          .forEach((p) => out.push(para([run(p.trim(), { color: pal.ink })], { after: 3 })));
      return out;
    }
    const t = s.titles[key] || key;
    switch (key) {
      case "summary": {
        if (!d.summary.trim()) return [];
        out.push(heading(t, pal, onSidebar));
        d.summary
          .split(/\n+/)
          .filter((p) => p.trim())
          .forEach((p) =>
            out.push(
              para([run(p.trim(), { italics: tpl === "executive", color: pal.ink })], {
                after: 3,
                align: "left",
              }),
            ),
          );
        break;
      }
      case "experience": {
        const items = d.experience.filter((e) => e.role.trim() || e.company.trim());
        if (!items.length) return [];
        out.push(heading(t, pal, onSidebar));
        items.forEach((e) => {
          out.push(titleLine(e.role || e.company, dates(e.start, e.end), pal));
          if (e.role)
            out.push(
              sub(
                [
                  { t: e.company, bold: true, color: pal.accent },
                  ...(e.location.trim() ? [{ t: `  ·  ${e.location.trim()}` }] : []),
                ],
                pal,
              ),
            );
          linesOf(e.bullets).forEach((b) => out.push(bullet(b, pal)));
        });
        break;
      }
      case "education": {
        const items = d.education.filter((e) => e.school.trim() || e.degree.trim());
        if (!items.length) return [];
        out.push(heading(t, pal, onSidebar));
        items.forEach((e) => {
          out.push(titleLine(e.degree || e.school, dates(e.start, e.end), pal));
          if (e.degree)
            out.push(
              sub(
                [
                  { t: e.school, bold: true, color: pal.accent },
                  ...(e.location.trim() ? [{ t: `  ·  ${e.location.trim()}` }] : []),
                ],
                pal,
              ),
            );
          linesOf(e.details).forEach((b) => out.push(bullet(b, pal)));
        });
        break;
      }
      case "skills": {
        const items = d.skills.filter((g) => g.name.trim() || g.items.trim());
        if (!items.length) return [];
        out.push(heading(t, pal, onSidebar));
        items.forEach((g) => {
          if (pal.narrow) {
            out.push(
              para([run(g.name, { bold: true, color: pal.ink })], { before: 4, keepNext: true }),
            );
            out.push(para([run(g.items, { color: pal.muted, size: body - 1 })], { after: 1 }));
          } else {
            out.push(
              para(
                [
                  ...(g.name.trim() ? [run(`${g.name.trim()}: `, { bold: true })] : []),
                  run(g.items),
                ],
                { after: 2 },
              ),
            );
          }
        });
        break;
      }
      case "projects": {
        const items = d.projects.filter((p) => p.name.trim());
        if (!items.length) return [];
        out.push(heading(t, pal, onSidebar));
        items.forEach((p) => {
          out.push(titleLine(p.name, p.link.trim(), pal, p.link.trim() ? url(p.link) : undefined));
          if (p.tech.trim()) out.push(sub([{ t: p.tech.trim(), italics: true }], pal));
          linesOf(p.bullets).forEach((b) => out.push(bullet(b, pal)));
        });
        break;
      }
      case "certifications": {
        const items = d.certifications.filter((c) => c.name.trim());
        if (!items.length) return [];
        out.push(heading(t, pal, onSidebar));
        items.forEach((c) => {
          if (pal.narrow) {
            out.push(
              para([run(c.name, { bold: true, color: pal.ink })], {
                before: 4,
                keepNext: !!c.issuer || !!c.date,
              }),
            );
            const meta = [c.issuer.trim(), c.date.trim()].filter(Boolean).join("  ·  ");
            if (meta)
              out.push(para([run(meta, { color: pal.muted, size: body - 1 })], { after: 1 }));
          } else {
            out.push(titleLine(c.name, c.date.trim(), pal));
            if (c.issuer.trim()) out.push(sub([{ t: c.issuer.trim() }], pal));
          }
        });
        break;
      }
      case "languages": {
        const items = d.languages.filter((l) => l.name.trim());
        if (!items.length) return [];
        out.push(heading(t, pal, onSidebar));
        items.forEach((l) =>
          out.push(
            para(
              [
                run(l.name.trim(), { bold: true, color: pal.ink }),
                ...(l.level.trim() ? [run(` — ${l.level.trim()}`, { color: pal.muted })] : []),
              ],
              { after: 1.5 },
            ),
          ),
        );
        break;
      }
    }
    return out;
  };

  const visible = s.order.filter((k) => !s.hidden.includes(k));

  /* ---------- avatar ---------- */
  const avatarRun = (pt: number) => {
    const m = /^data:image\/(png|jpe?g);base64,(.+)$/.exec(d.basics.avatar);
    if (!m) return null;
    const bin = atob(m[2]);
    const bytes = Uint8Array.from(bin, (c) => c.charCodeAt(0));
    const px = Math.round(pt * s.avatarScale * 1.333);
    return new D.ImageRun({
      type: m[1] === "png" ? "png" : "jpg",
      data: bytes,
      transformation: { width: px, height: px },
    });
  };

  /* ---------- header ---------- */
  const contact = contactItems(d.basics, vi);
  const contactRuns = (color: string, sep: string, sepColor: string) =>
    contact.flatMap((c, i) => [
      ...(i ? [run(sep, { color: sepColor, size: body - 1 })] : []),
      run(c.inline, { color, size: body - 1, link: c.link }),
    ]);

  const cell = (
    children: Child[],
    width: number,
    fill?: string,
    m = { top: 0, bottom: 0, left: 0, right: 0 },
  ) =>
    new D.TableCell({
      children: children.length ? children : [new D.Paragraph({})],
      width: { size: width, type: D.WidthType.DXA },
      shading: fill ? { type: D.ShadingType.CLEAR, fill, color: "auto" } : undefined,
      margins: m,
      borders: { top: none, bottom: none, left: none, right: none },
    });
  const table = (widths: number[], row: import("docx").TableCell[], minHeight?: number) =>
    new D.Table({
      width: { size: widths.reduce((a, b) => a + b, 0), type: D.WidthType.DXA },
      columnWidths: widths,
      borders: noBorders,
      rows: [
        new D.TableRow({
          children: row,
          height: minHeight ? { value: minHeight, rule: D.HeightRule.ATLEAST } : undefined,
        }),
      ],
    });

  const nameTitle = (
    center: boolean,
    nameColor: string,
    titleColor: string,
    nameSize: number,
  ): Child[] => {
    const out: Child[] = [];
    if (d.basics.name.trim())
      out.push(
        para(
          [
            run(d.basics.name, {
              bold: true,
              color: nameColor,
              size: nameSize,
              spacing: tpl === "executive" ? 20 : 0,
            }),
          ],
          { align: center ? "center" : "left", after: 1 },
        ),
      );
    if (d.basics.title.trim())
      out.push(
        para(
          [
            run(d.basics.title, {
              color: titleColor,
              size: Math.round(body * 1.3),
              italics: tpl === "executive",
            }),
          ],
          { align: center ? "center" : "left", after: 3 },
        ),
      );
    return out;
  };

  const children: Child[] = [];
  const av = avatarRun(
    tpl === "creative" ? 88 : tpl === "executive" ? 72 : tpl === "compact" ? 58 : 64,
  );

  if (sidebar) {
    const sideW = tpl === "modern" ? 3300 : 3500;
    const mainW = A4_W - sideW;
    const mainPalW: Pal = { ...mainPal, width: mainW - 900 };
    const sidePal: Pal =
      tpl === "modern"
        ? { ink: sideOn, muted: sideSoft, accent: sideOn, width: sideW - 800, narrow: true }
        : { ink, muted, accent, width: sideW - 700, narrow: true };

    const main: Child[] = [];
    const side: Child[] = [];
    if (tpl === "modern") {
      if (av) side.push(para([av], { align: "center", after: 8 }));
      if (contact.length) {
        side.push(heading(s.titles.contact || "Contact", sidePal, true));
        contact.forEach((c) => {
          side.push(
            para([run(c.label, { color: sideSoft, size: body - 3, caps: true, spacing: 15 })], {
              before: 5,
            }),
          );
          side.push(para([run(c.value, { color: sideOn, size: body - 1, link: c.link })], {}));
        });
      }
      main.push(...nameTitle(false, ink, accent, Math.round(body * 2.7)));
    }
    for (const key of visible) {
      if ((NARROW as OrderKey[]).includes(key)) side.push(...section(key, sidePal, true));
      else main.push(...section(key, mainPalW, false));
    }

    if (tpl === "creative") {
      const tint = hex(mix(s.accent, "#ffffff", 0.93));
      const onA = sideOn;
      const textW = A4_W - 1700 - (av ? 1900 : 0);
      const bandLeft: Child[] = [
        ...nameTitle(false, onA, sideSoft, Math.round(body * 2.9)),
        para(contactRuns(onA, "  ·  ", sideSoft), { before: 4 }),
      ];
      const bandRow = av
        ? table(
            [textW + 850, 1900 + 850],
            [
              cell(bandLeft, textW + 850, accent, { top: 600, bottom: 600, left: 850, right: 100 }),
              cell([para([av], { align: "right" })], 1900 + 850, accent, {
                top: 450,
                bottom: 450,
                left: 100,
                right: 850,
              }),
            ],
          )
        : table(
            [A4_W],
            [cell(bandLeft, A4_W, accent, { top: 600, bottom: 600, left: 850, right: 850 })],
          );
      children.push(bandRow);
      children.push(para([], { after: 6 }));
      const w2 = A4_W - 600 - 3500;
      children.push(
        table(
          [w2 + 600, 3500],
          [
            cell(main, w2 + 600, undefined, { top: 200, bottom: 0, left: 850, right: 350 }),
            cell(side, 3500, tint, { top: 200, bottom: 0, left: 350, right: 350 }),
          ],
          12500,
        ),
      );
    } else {
      children.push(
        table(
          [sideW, mainW],
          [
            cell(side, sideW, accent, { top: 700, bottom: 400, left: 400, right: 400 }),
            cell(main, mainW, undefined, { top: 700, bottom: 400, left: 450, right: 500 }),
          ],
          15300,
        ),
      );
    }
  } else {
    // Single-column templates.
    const centered = tpl === "executive";
    if (centered && av) children.push(para([av], { align: "center", after: 4 }));
    const head = nameTitle(
      centered,
      ink,
      accent,
      Math.round(body * (tpl === "compact" ? 2.35 : tpl === "executive" ? 2.9 : 2.6)),
    );
    const contactPara =
      tpl === "executive"
        ? para(contactRuns(muted, "   ·   ", accent), {
            align: "center",
            before: 5,
            bottomRule: { color: accent, size: 8 },
          })
        : para(contactRuns(muted, tpl === "minimal" ? "   /   " : "  |  ", "9A9A9A"), {
            before: 3,
          });
    if (av && !centered) {
      const textW = contentW - 1300;
      children.push(
        table(
          [textW, 1300],
          [cell([...head, contactPara], textW), cell([para([av], { align: "right" })], 1300)],
        ),
      );
    } else {
      children.push(...head, contactPara);
    }
    if (tpl === "minimal")
      children.push(para([], { after: 2, bottomRule: { color: ink, size: 4 } }));
    for (const key of visible) children.push(...section(key, mainPal, false));
  }

  /* ---------- footer ---------- */
  const footers =
    s.pageNumbers === "off"
      ? undefined
      : {
          default: new D.Footer({
            children: [
              new D.Paragraph({
                alignment:
                  s.pageNumbers === "left"
                    ? D.AlignmentType.LEFT
                    : s.pageNumbers === "right"
                      ? D.AlignmentType.RIGHT
                      : D.AlignmentType.CENTER,
                children: [
                  new D.TextRun({
                    children: [D.PageNumber.CURRENT, " / ", D.PageNumber.TOTAL_PAGES],
                    font,
                    size: 16,
                    color: "7A7A7A",
                  }),
                ],
              }),
            ],
          }),
        };

  const name = d.basics.name.trim();
  const file = new D.Document({
    creator: name || "Custom Resume",
    title: name ? `${name} – CV` : "CV",
    styles: { default: { document: { run: { font, size: body } } } },
    sections: [
      {
        properties: {
          page: {
            size: { width: A4_W, height: A4_H },
            margin: sidebar
              ? { top: 0, bottom: 520, left: 0, right: 0, footer: 250 }
              : { top: margin, bottom: margin, left: margin, right: margin, footer: 400 },
          },
        },
        footers,
        children,
      },
    ],
  });
  return D.Packer.toBlob(file);
}
