import {
  PDFArray,
  PDFDict,
  PDFDocument,
  PDFHexString,
  PDFName,
  PDFRawStream,
  PDFString,
  decodePDFRawStream,
} from "pdf-lib";

import type { ResumeDoc } from "../types";
import { ATTACHMENT_NAME, parsePayload } from "./serialize";
import { parseExtracted, type ExtractDraft, type RawItem } from "./text-parse";

export type ImportOutcome =
  | { kind: "embedded"; doc: ResumeDoc }
  | { kind: "extracted"; draft: ExtractDraft }
  | { kind: "unsupported"; reason: string };

const MAX_BYTES = 25 * 1024 * 1024;

function looksLikePdf(bytes: Uint8Array): boolean {
  // The header may be preceded by a little junk, but must appear early.
  const head = new TextDecoder("latin1").decode(bytes.subarray(0, 1024));
  return head.includes("%PDF-");
}

/** Our own attachment, read with pdf-lib: no worker, no rendering, instant. */
async function readAttachment(bytes: Uint8Array): Promise<string | null> {
  const pdf = await PDFDocument.load(bytes, { updateMetadata: false, throwOnInvalidObject: false });
  const names = pdf.catalog.lookupMaybe(PDFName.of("Names"), PDFDict);
  const files = names?.lookupMaybe(PDFName.of("EmbeddedFiles"), PDFDict);
  const arr = files?.lookupMaybe(PDFName.of("Names"), PDFArray);
  if (!arr) return null;
  for (let i = 0; i + 1 < arr.size(); i += 2) {
    const label = arr.lookup(i);
    const name =
      label instanceof PDFString || label instanceof PDFHexString ? label.decodeText() : "";
    if (name !== ATTACHMENT_NAME) continue;
    const spec = arr.lookup(i + 1, PDFDict);
    const ef = spec.lookupMaybe(PDFName.of("EF"), PDFDict);
    const stream = ef?.lookup(PDFName.of("F"));
    if (!(stream instanceof PDFRawStream)) continue;
    return new TextDecoder().decode(decodePDFRawStream(stream).decode());
  }
  return null;
}

async function loadPdfjs() {
  const pdfjs = await import("pdfjs-dist");
  pdfjs.GlobalWorkerOptions.workerSrc = new URL(
    "pdfjs-dist/build/pdf.worker.min.mjs",
    import.meta.url,
  ).toString();
  return pdfjs;
}

/**
 * Read a PDF into the editor.
 *  1. If it carries the data this app embeds on export, restore it exactly (template, style, data).
 *  2. Otherwise read the text and make a best guess for the person to check.
 *  3. Otherwise say plainly why not.
 */
export async function importPdf(file: File): Promise<ImportOutcome> {
  if (file.size > MAX_BYTES) {
    return { kind: "unsupported", reason: "This file is too large (25 MB max)." };
  }
  const bytes = new Uint8Array(await file.arrayBuffer());
  if (!looksLikePdf(bytes)) {
    return { kind: "unsupported", reason: "This is not a PDF file. Choose a .pdf file." };
  }

  // 1. Embedded data.
  try {
    const text = await readAttachment(bytes);
    if (text) {
      const doc = parsePayload(text);
      if (doc) return { kind: "embedded", doc };
    }
  } catch (e) {
    const msg = e instanceof Error ? e.message : "";
    if (/encrypt/i.test(msg)) {
      return {
        kind: "unsupported",
        reason: "This PDF is password protected, so it cannot be read.",
      };
    }
    // Not parseable by pdf-lib: try the text route below.
  }

  // 2. Text.
  try {
    const pdfjs = await loadPdfjs();
    const task = pdfjs.getDocument({ data: bytes.slice() });
    const pdf = await task.promise;

    // Other producers store attachments in a name tree pdf-lib does not walk.
    try {
      const att = (await pdf.getAttachments()) as Record<string, { content: Uint8Array }> | null;
      const ours = att?.[ATTACHMENT_NAME];
      if (ours) {
        const doc = parsePayload(new TextDecoder().decode(ours.content));
        if (doc) return { kind: "embedded", doc };
      }
    } catch {
      // ignore
    }

    const items: RawItem[] = [];
    let pageW = 595.28;
    let chars = 0;
    const pages = Math.min(pdf.numPages, 12);
    for (let p = 1; p <= pages; p++) {
      const page = await pdf.getPage(p);
      const view = page.getViewport({ scale: 1 });
      if (p === 1) pageW = view.width;
      const content = await page.getTextContent();
      for (const it of content.items) {
        if (!("str" in it) || !it.str.trim()) continue;
        const [a, b, c, d, e, f] = it.transform as number[];
        // Watermarks: rotated or very large text is never CV content.
        if (Math.abs(b) > 0.01 || Math.abs(c) > 0.01 || Math.abs(d) > 44) continue;
        const size = Math.abs(d) || Math.abs(a) || it.height;
        items.push({ page: p - 1, x: e, y: view.height - f, w: it.width, size, str: it.str });
        chars += it.str.length;
      }
    }
    void task.destroy();

    if (chars < 40) {
      return {
        kind: "unsupported",
        reason:
          "This PDF has almost no text (it may be a scan or an image). Only PDFs with text are supported, ideally one exported from this app.",
      };
    }
    const draft = parseExtracted(items, pageW);
    if (!draft.found.length && !draft.doc.data.basics.name) {
      return {
        kind: "unsupported",
        reason:
          "Could not recognise a CV structure in this PDF. Use a PDF exported from one of this app's templates.",
      };
    }
    return { kind: "extracted", draft };
  } catch (e) {
    const msg = e instanceof Error ? e.message : "";
    if (/password/i.test(msg)) {
      return {
        kind: "unsupported",
        reason: "This PDF is password protected, so it cannot be read.",
      };
    }
    return {
      kind: "unsupported",
      reason: "Could not read this PDF (it may be damaged or in an unusual format).",
    };
  }
}
