"use client";

import {
  useDeferredValue,
  useEffect,
  useMemo,
  useRef,
  useState,
  useSyncExternalStore,
} from "react";

import Link from "next/link";

import "../custom-resume.css";
import { EMPTY_DATA, TEMPLATES } from "../data";
import { setSettings, type Doc } from "../lib/actions";
import { fontStatus, getFamily, loadFamily, measurerFor, subscribeFonts } from "../lib/fonts";
import { layoutResume } from "../lib/layout";
import { exportDocx } from "../lib/docx-export";
import { downloadName, exportPdf } from "../lib/pdf-export";
import { importPdf } from "../lib/pdf-import";
import {
  redo,
  replaceDoc,
  resetDraft,
  undo,
  updateDoc,
  useResumeDoc,
  useSaveStatus,
} from "../lib/store";
import type { FontId, TemplateId } from "../types";
import { ContentEditor } from "./content-editor";
import { Icon, IconButton } from "./fields";
import { FileMenu } from "./file-menu";
import { ImportDialog, type ImportView } from "./import-dialog";
import { Preview } from "./preview";
import { StyleEditor } from "./style-editor";
import { TemplatePicker } from "./template-picker";

type Tab = "template" | "content" | "style";
const TABS: { id: Tab; label: string }[] = [
  { id: "template", label: "Template" },
  { id: "content", label: "Content" },
  { id: "style", label: "Design" },
];

function useFamily(id: FontId) {
  const status = useSyncExternalStore(
    subscribeFonts,
    () => fontStatus(id),
    () => "loading" as const,
  );
  useEffect(() => {
    loadFamily(id).catch(() => {});
  }, [id]);
  return { status, family: status === "ready" ? getFamily(id) : null };
}

function formatTime(ms: number): string {
  return new Date(ms).toLocaleTimeString("en-US", { hour: "2-digit", minute: "2-digit" });
}

export function CustomResumeApp({ fontClassName }: { fontClassName: string }) {
  const doc = useResumeDoc();
  const status = useSaveStatus();
  const deferred = useDeferredValue(doc);
  const { status: fontState, family } = useFamily(doc.settings.font);

  const [tab, setTab] = useState<Tab>("content");
  const [view, setView] = useState<ImportView | null>(null);
  const [notice, setNotice] = useState<{ tone: "ok" | "error"; text: string } | null>(null);
  const [exporting, setExporting] = useState(false);
  const [exportingWord, setExportingWord] = useState(false);
  const [dragging, setDragging] = useState(false);
  const fileRef = useRef<HTMLInputElement>(null);
  const noticeTimer = useRef<ReturnType<typeof setTimeout> | undefined>(undefined);

  const flash = (tone: "ok" | "error", text: string) => {
    clearTimeout(noticeTimer.current);
    setNotice({ tone, text });
    noticeTimer.current = setTimeout(() => setNotice(null), 7000);
  };

  const pages = useMemo(
    () => (family ? layoutResume(deferred, measurerFor(family)) : null),
    [deferred, family],
  );

  const update = (fn: (d: Doc) => Doc) => updateDoc(fn);

  // Undo / redo outside text fields.
  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (!(e.metaKey || e.ctrlKey) || e.key.toLowerCase() !== "z") return;
      const t = e.target as HTMLElement | null;
      if (t && (t.tagName === "INPUT" || t.tagName === "TEXTAREA" || t.isContentEditable)) return;
      e.preventDefault();
      if (e.shiftKey) redo();
      else undo();
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, []);

  const handleFile = async (file: File) => {
    setView({ kind: "busy", name: file.name });
    const out = await importPdf(file);
    if (out.kind === "embedded") {
      replaceDoc(out.doc);
      setView(null);
      const tpl = TEMPLATES.find((t) => t.id === out.doc.settings.template)?.name ?? "";
      flash(
        "ok",
        `Restored your CV from the PDF (${tpl} template) with all its data and settings. Use Undo to go back.`,
      );
    } else if (out.kind === "extracted") {
      setView({ kind: "review", draft: out.draft, name: file.name });
    } else {
      setView({ kind: "error", reason: out.reason });
    }
  };

  const onExport = async () => {
    if (!family || !pages) return;
    setExporting(true);
    try {
      const bytes = await exportPdf(doc, family, pages, (s, f, size, track) =>
        measurerFor(family).width(s, f, size, track),
      );
      const blob = new Blob([bytes as BlobPart], { type: "application/pdf" });
      const url = URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = downloadName(doc);
      document.body.appendChild(a);
      a.click();
      a.remove();
      setTimeout(() => URL.revokeObjectURL(url), 10_000);
      flash(
        "ok",
        `Created ${a.download}. The text is selectable and the PDF carries your data so it can be imported again.`,
      );
    } catch {
      flash("error", "Could not create the PDF. Please try again.");
    } finally {
      setExporting(false);
    }
  };

  const onExportWord = async () => {
    setExportingWord(true);
    try {
      const blob = await exportDocx(doc);
      const url = URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = downloadName(doc).replace(/\.pdf$/, ".docx");
      document.body.appendChild(a);
      a.click();
      a.remove();
      setTimeout(() => URL.revokeObjectURL(url), 10_000);
      flash(
        "ok",
        `Created ${a.download}. Word layout is an editable approximation; use the PDF for the exact design and for re-importing.`,
      );
    } catch {
      flash("error", "Could not create the Word file. Please try again.");
    } finally {
      setExportingWord(false);
    }
  };

  const pickTemplate = (id: TemplateId) => {
    const accentOf = (t: TemplateId) => TEMPLATES.find((x) => x.id === t)!.defaultAccent;
    update((d) => {
      // Keep a colour the person chose; follow the template's own colour only while it is untouched.
      const untouched = d.settings.accent.toLowerCase() === accentOf(d.settings.template);
      return setSettings(d, { template: id, ...(untouched ? { accent: accentOf(id) } : {}) });
    });
  };

  return (
    <>
      <MobileNotice fontClassName={fontClassName} />
      <main
        data-page-theme="light"
        className={`resume-app hidden h-dvh flex-col lg:flex ${fontClassName}`}
        onDragOver={(e) => {
          if (e.dataTransfer.types.includes("Files")) {
            e.preventDefault();
            setDragging(true);
          }
        }}
        onDragLeave={(e) => {
          if (e.currentTarget === e.target) setDragging(false);
        }}
        onDrop={(e) => {
          setDragging(false);
          const f = e.dataTransfer.files?.[0];
          if (f) {
            e.preventDefault();
            void handleFile(f);
          }
        }}
      >
        <header className="flex flex-wrap items-center gap-x-3 gap-y-2 border-b border-[var(--line)] bg-[var(--paper)] px-3 py-2 sm:px-4">
          <div className="mr-auto flex items-baseline gap-3">
            <h1 className="brand-name text-base font-extrabold tracking-tight">
              Custom <span>Resume</span>
            </h1>
            <span
              className="hidden text-xs text-[var(--muted)] sm:inline"
              aria-live="polite"
              data-testid="save-status"
            >
              {status.failed
                ? "Draft not saved (browser storage is blocked)"
                : status.savedAt
                  ? `Draft saved at ${formatTime(status.savedAt)}`
                  : "Drafts save automatically in your browser"}
            </span>
          </div>
          <div className="flex items-center gap-1">
            <IconButton label="Undo (Ctrl/⌘ Z)" onClick={undo} disabled={!status.canUndo}>
              {Icon.undo}
            </IconButton>
            <IconButton label="Redo (Ctrl/⌘ Shift Z)" onClick={redo} disabled={!status.canRedo}>
              {Icon.redo}
            </IconButton>
          </div>
          <input
            ref={fileRef}
            type="file"
            accept="application/pdf,.pdf"
            className="sr-only"
            data-testid="pdf-input"
            onChange={(e) => {
              const f = e.target.files?.[0];
              e.target.value = "";
              if (f) void handleFile(f);
            }}
          />
          <FileMenu
            onImport={() => fileRef.current?.click()}
            onExportPdf={onExport}
            onExportWord={onExportWord}
            pdfDisabled={!pages}
            pdfBusy={exporting}
            wordBusy={exportingWord}
            onSample={() => {
              if (
                window.confirm(
                  "Replace the current content with the sample CV (Software Engineer)?",
                )
              )
                resetDraft();
            }}
            onBlank={() => {
              if (window.confirm("Clear everything and start a blank CV?")) {
                replaceDoc({ data: structuredClone(EMPTY_DATA), settings: doc.settings });
              }
            }}
          />
        </header>

        {notice ? (
          <div
            role="status"
            className={`flex items-start justify-between gap-3 border-b px-4 py-2 text-sm ${
              notice.tone === "ok"
                ? "border-emerald-200 bg-emerald-50 text-emerald-900"
                : "border-red-200 bg-red-50 text-red-900"
            }`}
            data-testid="notice"
          >
            <span>{notice.text}</span>
            <button
              type="button"
              onClick={() => setNotice(null)}
              aria-label="Dismiss"
              className="shrink-0"
            >
              {Icon.close}
            </button>
          </div>
        ) : null}

        <div className="grid min-h-0 flex-1 grid-cols-[minmax(380px,500px)_1fr] grid-rows-1">
          <section
            className={`flex min-h-0 flex-col border-r border-[var(--line-strong)] bg-[var(--paper-2)]`}
            aria-label="Editor"
          >
            <div
              role="tablist"
              className="flex gap-1 border-b border-[var(--line-strong)] bg-[var(--card)] px-3 pt-2"
            >
              {TABS.map((t) => (
                <button
                  key={t.id}
                  role="tab"
                  type="button"
                  aria-selected={tab === t.id}
                  onClick={() => setTab(t.id)}
                  data-testid={`tab-${t.id}`}
                  className={`-mb-px rounded-t-lg border border-b-0 px-4 py-2 text-sm font-medium ${
                    tab === t.id
                      ? "border-[var(--line-strong)] bg-[var(--paper-2)] text-[var(--ink)]"
                      : "border-transparent text-[var(--muted)] hover:text-[var(--ink)]"
                  }`}
                >
                  {t.label}
                </button>
              ))}
            </div>
            <div className="cv-scroll min-h-0 flex-1 overflow-y-auto p-4 pb-6">
              {fontState === "failed" ? (
                <p className="rounded-[10px] border border-red-200 bg-red-50 p-3 text-sm text-red-800">
                  Could not load the fonts. Check your connection and reload.
                </p>
              ) : null}
              {tab === "template" && family ? (
                <TemplatePicker doc={deferred} family={family} onPick={pickTemplate} />
              ) : null}
              {tab === "content" ? <ContentEditor doc={doc} update={update} /> : null}
              {tab === "style" ? <StyleEditor doc={doc} update={update} /> : null}
            </div>
          </section>

          <section className={`block min-h-0 min-w-0`} aria-label="Preview">
            {family && pages ? (
              <Preview pages={pages} family={family} />
            ) : (
              <div
                className="grid h-full place-items-center text-sm text-[var(--muted)]"
                role="status"
              >
                {fontState === "failed"
                  ? "No font available to draw the preview."
                  : "Loading fonts…"}
              </div>
            )}
          </section>
        </div>

        {dragging ? (
          <div className="pointer-events-none fixed inset-0 z-50 grid place-items-center bg-[var(--green)]/30 backdrop-blur-[1px]">
            <p className="rounded-[12px] border-2 border-dashed border-[var(--ink)] bg-[var(--card)] px-6 py-4 text-sm font-medium text-[var(--ink)]">
              Drop a PDF here to import it
            </p>
          </div>
        ) : null}

        {view ? (
          <ImportDialog
            key={view.kind + (view.kind === "review" ? view.name : "")}
            view={view}
            onClose={() => setView(null)}
            onPickAnother={() => {
              setView(null);
              fileRef.current?.click();
            }}
            onApply={(d) => {
              replaceDoc(d);
              setView(null);
              setTab("content");
              flash(
                "ok",
                "Applied the data read from the PDF. Review each section in the Content tab and fix anything that looks off.",
              );
            }}
          />
        ) : null}
      </main>
    </>
  );
}

/** Phones and small tablets: the editor needs a wide screen, so say so instead of squeezing it in. */
function MobileNotice({ fontClassName }: { fontClassName: string }) {
  return (
    <main
      data-page-theme="light"
      data-testid="mobile-notice"
      className={`resume-app grid min-h-dvh place-items-center p-6 lg:hidden ${fontClassName}`}
    >
      <div className="w-full max-w-sm rounded-[12px] border-[1.5px] border-[var(--ink)] bg-[var(--card)] p-6 text-center shadow-[var(--pop)]">
        <h1 className="brand-name mb-3 text-lg font-extrabold">
          Custom <span>Resume</span>
        </h1>
        <p className="text-sm font-bold text-[var(--ink)]">Desktop only</p>
        <p className="mt-2 text-xs leading-relaxed text-[var(--muted)]">
          The CV editor needs a wider screen than a phone or small tablet has. Open this page on a
          computer (a window at least 1024 px wide) to build and export your CV.
        </p>
        <Link href="/" className="ra-btn primary mt-5 justify-center no-underline">
          Back to the site
        </Link>
      </div>
    </main>
  );
}
