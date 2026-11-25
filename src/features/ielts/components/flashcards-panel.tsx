"use client";

import { useEffect, useRef, useState } from "react";

import { cn } from "@/lib/cn";

import { exportFlashcards, importFlashcards } from "../lib/flashcards-xlsx";
import { useFlashcards } from "../lib/study-store";

type Mode = "review" | "list";

/**
 * The saved flashcards: a review mode (flip through one card at a time) and a list mode (see
 * everything, jump back to the chapter a word came from, delete).
 */
export function FlashcardsPanel({ onClose }: { onClose: () => void }) {
  const { items, update } = useFlashcards();
  const [mode, setMode] = useState<Mode>("review");
  const [index, setIndex] = useState(0);
  const [flipped, setFlipped] = useState(false);
  const [notice, setNotice] = useState("");
  const fileRef = useRef<HTMLInputElement>(null);

  // Deleting can leave the index past the end.
  const at = Math.min(index, Math.max(items.length - 1, 0));
  const card = items[at];

  const go = (delta: number) => {
    if (!items.length) return;
    setIndex((at + delta + items.length) % items.length);
    setFlipped(false);
  };

  useEffect(() => {
    const onKey = (event: KeyboardEvent) => {
      if (event.key === "Escape") onClose();
      if (mode !== "review") return;
      if (event.key === "ArrowRight") go(1);
      else if (event.key === "ArrowLeft") go(-1);
      else if (event.key === " " && !(event.target as HTMLElement).closest("button")) {
        event.preventDefault();
        setFlipped((f) => !f);
      }
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  });

  const onExport = async () => {
    try {
      await exportFlashcards(items);
      setNotice(`Exported ${items.length} cards.`);
    } catch {
      setNotice("Could not export the file.");
    }
  };

  const onImport = async (file: File | undefined) => {
    if (!file) return;
    try {
      const { cards, result } = await importFlashcards(file, items);
      update(() => cards);
      setNotice(
        `Imported: ${result.added} added, ${result.updated} updated` +
          (result.skipped ? `, ${result.skipped} skipped (missing word or meaning).` : "."),
      );
    } catch {
      setNotice(
        "Could not read that file. Use an .xlsx with Word in column A and Meaning in column B.",
      );
    }
  };

  const remove = (id: string) => update((all) => all.filter((c) => c.id !== id));

  return (
    <div
      className="fc-backdrop"
      onMouseDown={(event) => event.target === event.currentTarget && onClose()}
    >
      <div
        className="fc-dialog fc-panel"
        role="dialog"
        aria-modal="true"
        aria-labelledby="fcp-title"
      >
        <div className="fc-panel-head">
          <h2 id="fcp-title">Flashcards · {items.length}</h2>
          <div className="fc-tabs" role="tablist">
            {(["review", "list"] as const).map((m) => (
              <button
                key={m}
                type="button"
                role="tab"
                aria-selected={mode === m}
                className={cn(mode === m && "is-on")}
                onClick={() => setMode(m)}
              >
                {m === "review" ? "Review" : "List"}
              </button>
            ))}
          </div>
          <button type="button" className="fc-close" aria-label="Close" onClick={onClose}>
            ×
          </button>
        </div>

        {!card ? (
          <p className="fc-empty">
            No flashcards yet. Select a word in a chapter and press the card icon.
          </p>
        ) : mode === "review" ? (
          <>
            <button
              type="button"
              className={cn("fc-card", flipped && "is-flipped")}
              onClick={() => setFlipped((f) => !f)}
              aria-label={flipped ? "Show word" : "Show meaning"}
            >
              <span className="fc-card-inner">
                <span className="fc-face fc-front" aria-hidden={flipped}>
                  <span className="fc-card-label">Word</span>
                  <span className="fc-card-text">{card.word}</span>
                </span>
                <span className="fc-face fc-back" aria-hidden={!flipped}>
                  <span className="fc-card-label">Meaning</span>
                  <span className="fc-card-text">{card.meaning}</span>
                </span>
              </span>
            </button>
            <div className="fc-actions fc-nav">
              <button type="button" className="btn" onClick={() => go(-1)}>
                ← Prev
              </button>
              <span className="muted">
                {at + 1} / {items.length}
              </span>
              <button type="button" className="btn primary" onClick={() => go(1)}>
                Next →
              </button>
            </div>
          </>
        ) : (
          <ul className="fc-list">
            {items.map((c) => (
              <li key={c.id}>
                <div>
                  <strong>{c.word}</strong>
                  <span>{c.meaning}</span>
                </div>
                <a href={`#${c.chapterId}`} onClick={onClose}>
                  Open
                </a>
                <button type="button" aria-label={`Delete ${c.word}`} onClick={() => remove(c.id)}>
                  Delete
                </button>
              </li>
            ))}
          </ul>
        )}

        <div className="fc-io">
          <button
            type="button"
            className="fc-io-btn"
            disabled={!items.length}
            title="Export the cards as an .xlsx file"
            onClick={onExport}
          >
            <TransferIcon direction="down" />
            Export
          </button>
          <button
            type="button"
            className="fc-io-btn"
            title="Import cards from an .xlsx file"
            onClick={() => fileRef.current?.click()}
          >
            <TransferIcon direction="up" />
            Import
          </button>
          <input
            ref={fileRef}
            type="file"
            hidden
            accept=".xlsx,application/vnd.openxmlformats-officedocument.spreadsheetml.sheet"
            onChange={(event) => {
              void onImport(event.target.files?.[0]);
              event.target.value = "";
            }}
          />
          {notice && (
            <span className="fc-notice" role="status">
              {notice}
            </span>
          )}
        </div>
      </div>
    </div>
  );
}

/** A tray with an arrow into or out of it. */
function TransferIcon({ direction }: { direction: "up" | "down" }) {
  return (
    <svg viewBox="0 0 24 24" aria-hidden="true">
      <path
        d={
          direction === "down"
            ? "M12 4v11m0 0-4-4m4 4 4-4M5 19h14"
            : "M12 15V4m0 0L8 8m4-4 4 4M5 19h14"
        }
        fill="none"
        stroke="currentColor"
        strokeWidth="1.8"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
}
